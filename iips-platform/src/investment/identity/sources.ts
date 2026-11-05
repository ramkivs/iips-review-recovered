/**
 * IID-1 — versioned identity source files (eligible roster, listing map, corporate-action table).
 *
 * Every file is content-addressed: its "version" is the sha256 digest of its canonical content, so a
 * silently edited roster cannot masquerade as the same roster. Loading is fail-closed and total: one
 * structural defect rejects the file set, because a partially trusted roster is exactly how a wrong
 * identity gets manufactured.
 *
 * Files live in the existing local data domain as plain JSON — no database, no new store:
 *   ${IIPS_DATA_DIR}/investment/identity/eligible-roster.json
 *   ${IIPS_DATA_DIR}/investment/identity/listing-map.json
 *   ${IIPS_DATA_DIR}/investment/identity/corporate-actions.json
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { digestOf } from '../fundamentals/canonical';
import {
  IdError,
  EXCHANGES,
  INSTRUMENT_TYPES,
  LISTING_SERIES,
  isValidCin,
  isValidIsin,
  listingId as composeListingId,
  parseIssuerId,
  parseListingId,
  parseSecurityId,
} from '../contracts/ids';
import type { CorporateActionRecord } from '../fundamentals/types';
import {
  IDENTITY_SCHEMA,
  type CorporateActionTable,
  type EligibleRoster,
  type IdentitySources,
  type ListingMap,
  type ListingMapEntry,
  type RosterIssuer,
  type RosterSecurity,
} from './types';

export interface SourceIssue {
  readonly file: 'eligible-roster.json' | 'listing-map.json' | 'corporate-actions.json';
  readonly code: string;
  readonly subject: string;
  readonly detail: string;
}

export type SourceLoadResult =
  | { readonly available: true; readonly sources: IdentitySources }
  | { readonly available: false; readonly issues: readonly SourceIssue[] };

const CORPORATE_ACTION_TYPES = new Set<string>([
  'SPLIT',
  'BONUS',
  'CONSOLIDATION',
  'RIGHTS',
  'BUYBACK_TENDER',
  'BUYBACK_OPEN_MARKET',
  'MERGER',
  'DEMERGER',
  'SYMBOL_CHANGE',
  'NAME_CHANGE',
  'DELISTING',
  'PREFERENCE_REDEMPTION',
  'CAPITAL_REDUCTION',
]);

function issue(
  file: SourceIssue['file'],
  code: string,
  subject: string,
  detail: string,
): SourceIssue {
  return { file, code, subject, detail };
}

function parseJson(text: string, file: SourceIssue['file'], issues: SourceIssue[]): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    issues.push(issue(file, 'INVALID_JSON', file, error instanceof Error ? error.message : String(error)));
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

/** Validate the roster structurally and semantically. Returns the accepted roster plus issues. */
export function validateRoster(text: string): { roster: EligibleRoster | null; issues: readonly SourceIssue[] } {
  const file = 'eligible-roster.json' as const;
  const issues: SourceIssue[] = [];
  const parsed = parseJson(text, file, issues);
  if (parsed === null) return { roster: null, issues };

  const root = asRecord(parsed);
  if (root.schemaVersion !== IDENTITY_SCHEMA) {
    issues.push(issue(file, 'SCHEMA_MISMATCH', file, `expected ${IDENTITY_SCHEMA}`));
    return { roster: null, issues };
  }

  const issuers: RosterIssuer[] = [];
  const seenIssuerIds = new Set<string>();
  const seenCins = new Map<string, string>();
  const seenEquityIsins = new Map<string, string>();

  for (const [index, raw] of asArray(root.issuers).entries()) {
    const record = asRecord(raw);
    const subject = readString(record, 'issuerId') ?? `issuers[${index}]`;
    const issuerIdRaw = readString(record, 'issuerId');
    if (issuerIdRaw === null) {
      issues.push(issue(file, 'ISSUER_ID_MISSING', subject, 'issuerId is required'));
      continue;
    }
    let issuerId: string;
    try {
      issuerId = parseIssuerId(issuerIdRaw);
    } catch (error) {
      issues.push(
        issue(file, error instanceof IdError ? error.code : 'ISSUER_ID_INVALID', subject, String((error as Error).message)),
      );
      continue;
    }
    if (seenIssuerIds.has(issuerId)) {
      issues.push(issue(file, 'DUPLICATE_ISSUER', subject, 'issuer appears more than once'));
      continue;
    }
    seenIssuerIds.add(issuerId);

    const cin = readString(record, 'cin');
    const equityIsin = readString(record, 'equityIsin');
    const basis: RosterIssuer['issuerKeyBasis'] = issuerId.startsWith('IN:CIN:') ? 'CIN' : 'EQUITY_ISIN';
    if (basis === 'CIN') {
      if (cin === null || !isValidCin(cin)) {
        issues.push(issue(file, 'CIN_INVALID', subject, 'a CIN-keyed issuer requires a structurally valid CIN'));
        continue;
      }
      if (issuerId !== `IN:CIN:${cin.toUpperCase()}`) {
        issues.push(issue(file, 'ISSUER_KEY_CONFLICT', subject, `issuerId does not match its CIN ${cin}`));
        continue;
      }
      const previous = seenCins.get(cin.toUpperCase());
      if (previous !== undefined && previous !== issuerId) {
        issues.push(issue(file, 'ISSUER_KEY_CONFLICT', subject, `CIN ${cin} is claimed by ${previous} as well`));
        continue;
      }
      seenCins.set(cin.toUpperCase(), issuerId);
    } else {
      if (equityIsin === null || !isValidIsin(equityIsin)) {
        issues.push(issue(file, 'ISIN_INVALID', subject, 'an equity-ISIN-keyed issuer requires a valid ISIN'));
        continue;
      }
      if (issuerId !== `IN:EQISIN:${equityIsin.toUpperCase()}`) {
        issues.push(issue(file, 'ISSUER_KEY_CONFLICT', subject, `issuerId does not match its equity ISIN ${equityIsin}`));
        continue;
      }
    }
    if (equityIsin !== null) {
      const previous = seenEquityIsins.get(equityIsin.toUpperCase());
      if (previous !== undefined && previous !== issuerId) {
        issues.push(
          issue(file, 'ISSUER_KEY_CONFLICT', subject, `equity ISIN ${equityIsin} is claimed by ${previous} as well`),
        );
        continue;
      }
      seenEquityIsins.set(equityIsin.toUpperCase(), issuerId);
    }

    const status = readString(record, 'status') ?? 'ELIGIBLE';
    if (status !== 'ELIGIBLE' && status !== 'EXCLUDED') {
      issues.push(issue(file, 'INVALID_STATUS', subject, `status "${status}" is not ELIGIBLE|EXCLUDED`));
      continue;
    }
    issuers.push({
      issuerId,
      legalName: readString(record, 'legalName') ?? issuerId,
      cin: cin === null ? null : cin.toUpperCase(),
      equityIsin: equityIsin === null ? null : equityIsin.toUpperCase(),
      issuerKeyBasis: basis,
      sector: readString(record, 'sector') ?? 'UNCLASSIFIED',
      subSegment: readString(record, 'subSegment'),
      status,
      statusReason: readString(record, 'statusReason'),
      foreignIssuer: record.foreignIssuer === true,
    });
  }

  const issuerById = new Map(issuers.map((issuer) => [issuer.issuerId, issuer]));
  const securities: RosterSecurity[] = [];
  const seenSecurityIds = new Set<string>();
  const seenIsins = new Map<string, string>();

  for (const [index, raw] of asArray(root.securities).entries()) {
    const record = asRecord(raw);
    const subject = readString(record, 'securityId') ?? `securities[${index}]`;
    const securityIdRaw = readString(record, 'securityId');
    const isinRaw = readString(record, 'isin');
    if (securityIdRaw === null || isinRaw === null) {
      issues.push(issue(file, 'SECURITY_INCOMPLETE', subject, 'securityId and isin are required'));
      continue;
    }
    if (!isValidIsin(isinRaw)) {
      issues.push(issue(file, 'ISIN_INVALID', subject, `"${isinRaw}" is not a valid ISIN`));
      continue;
    }
    let securityId: string;
    try {
      securityId = parseSecurityId(securityIdRaw);
    } catch (error) {
      issues.push(issue(file, 'SECURITY_ID_INVALID', subject, String((error as Error).message)));
      continue;
    }
    if (securityId !== `IN:ISIN:${isinRaw.toUpperCase()}`) {
      issues.push(issue(file, 'ISSUER_KEY_CONFLICT', subject, 'securityId does not match its ISIN'));
      continue;
    }
    if (seenSecurityIds.has(securityId)) {
      issues.push(issue(file, 'DUPLICATE_SECURITY', subject, 'security appears more than once'));
      continue;
    }
    seenSecurityIds.add(securityId);
    const duplicateIsin = seenIsins.get(isinRaw.toUpperCase());
    if (duplicateIsin !== undefined) {
      issues.push(issue(file, 'DUPLICATE_ISIN', subject, `ISIN already belongs to ${duplicateIsin}`));
      continue;
    }
    seenIsins.set(isinRaw.toUpperCase(), securityId);

    const issuerIdRaw = readString(record, 'issuerId');
    if (issuerIdRaw === null || !issuerById.has(issuerIdRaw)) {
      issues.push(issue(file, 'UNKNOWN_ISSUER', subject, `issuer "${String(issuerIdRaw)}" is not in the roster`));
      continue;
    }
    const instrumentType = readString(record, 'instrumentType') ?? 'EQUITY';
    if (!(INSTRUMENT_TYPES as readonly string[]).includes(instrumentType)) {
      issues.push(issue(file, 'INVALID_INSTRUMENT_TYPE', subject, `"${instrumentType}" is not a known instrument class`));
      continue;
    }
    const status = readString(record, 'status') ?? (instrumentType === 'EQUITY' ? 'ASSESSABLE' : 'OUT_OF_SCOPE');
    if (status !== 'ASSESSABLE' && status !== 'OUT_OF_SCOPE' && status !== 'INELIGIBLE') {
      issues.push(issue(file, 'INVALID_STATUS', subject, `status "${status}" is not a known security status`));
      continue;
    }
    if (status === 'ASSESSABLE' && instrumentType !== 'EQUITY') {
      issues.push(
        issue(file, 'ASSESSABLE_NON_EQUITY', subject, `a ${instrumentType} security may not be marked ASSESSABLE in v1`),
      );
      continue;
    }
    securities.push({
      securityId,
      issuerId: issuerIdRaw,
      isin: isinRaw.toUpperCase(),
      instrumentType,
      status,
      statusReason: readString(record, 'statusReason'),
    });
  }

  // An issuer that declares an equity ISIN must actually own a security with that ISIN (AC-1.5).
  for (const issuer of issuers) {
    if (issuer.equityIsin === null) continue;
    const owns = securities.some(
      (security) => security.issuerId === issuer.issuerId && security.isin === issuer.equityIsin,
    );
    if (!owns) {
      issues.push(
        issue(
          file,
          'ISSUER_KEY_CONFLICT',
          issuer.issuerId,
          `declares equity ISIN ${issuer.equityIsin} but no security with that ISIN belongs to it`,
        ),
      );
    }
  }

  if (issues.length > 0) return { roster: null, issues };
  return {
    roster: {
      schemaVersion: IDENTITY_SCHEMA,
      rosterLabel: readString(root, 'rosterLabel') ?? 'unnamed roster',
      issuers,
      securities,
    },
    issues,
  };
}

export function validateListingMap(
  text: string,
  roster: EligibleRoster,
): { listingMap: ListingMap | null; issues: readonly SourceIssue[] } {
  const file = 'listing-map.json' as const;
  const issues: SourceIssue[] = [];
  const parsed = parseJson(text, file, issues);
  if (parsed === null) return { listingMap: null, issues };
  const root = asRecord(parsed);
  if (root.schemaVersion !== IDENTITY_SCHEMA) {
    issues.push(issue(file, 'SCHEMA_MISMATCH', file, `expected ${IDENTITY_SCHEMA}`));
    return { listingMap: null, issues };
  }

  const securityById = new Map(roster.securities.map((security) => [security.securityId, security]));
  const entries: ListingMapEntry[] = [];
  const byKey = new Map<string, ListingMapEntry[]>();

  for (const [index, raw] of asArray(root.entries).entries()) {
    const record = asRecord(raw);
    const subject = readString(record, 'listingId') ?? `entries[${index}]`;
    const listingIdRaw = readString(record, 'listingId');
    if (listingIdRaw === null) {
      issues.push(issue(file, 'LISTING_ID_MISSING', subject, 'listingId is required'));
      continue;
    }
    let listingId: string;
    try {
      listingId = parseListingId(listingIdRaw);
    } catch (error) {
      issues.push(
        issue(file, error instanceof IdError ? error.code : 'LISTING_ID_INVALID', subject, String((error as Error).message)),
      );
      continue;
    }
    const parts = listingId.split(':');
    const exchange = parts[1]!;
    const symbol = parts[2]!;
    const series = parts[3]!;
    const instrumentType = parts[4]!;
    if (!(EXCHANGES as readonly string[]).includes(exchange)) {
      issues.push(issue(file, 'EXCHANGE_NOT_SUPPORTED', subject, exchange));
      continue;
    }
    if (!(LISTING_SERIES as readonly string[]).includes(series)) {
      issues.push(issue(file, 'INVALID_SERIES', subject, series));
      continue;
    }
    if (listingId !== composeListingId({ exchange: exchange as never, symbol, series: series as never, instrumentType: instrumentType as never })) {
      issues.push(issue(file, 'LISTING_ID_INVALID', subject, 'listingId is not in canonical form'));
      continue;
    }

    const securityIdRaw = readString(record, 'securityId');
    const security = securityIdRaw === null ? undefined : securityById.get(securityIdRaw);
    if (security === undefined) {
      issues.push(issue(file, 'UNKNOWN_SECURITY', subject, `security "${String(securityIdRaw)}" is not in the roster`));
      continue;
    }
    if (security.instrumentType !== instrumentType) {
      issues.push(
        issue(file, 'INSTRUMENT_MISMATCH', subject, `listing declares ${instrumentType} but the security is ${security.instrumentType}`),
      );
      continue;
    }
    const effectiveFrom = readString(record, 'effectiveFrom');
    const effectiveTo = readString(record, 'effectiveTo');
    if (effectiveFrom === null) {
      issues.push(issue(file, 'EFFECTIVE_FROM_MISSING', subject, 'effectiveFrom is required'));
      continue;
    }
    if (effectiveTo !== null && effectiveTo < effectiveFrom) {
      issues.push(issue(file, 'WINDOW_INVERTED', subject, `${effectiveFrom}..${effectiveTo}`));
      continue;
    }

    const entry: ListingMapEntry = {
      listingId,
      securityId: security.securityId,
      issuerId: security.issuerId,
      exchange,
      symbol,
      series,
      instrumentType,
      effectiveFrom,
      effectiveTo,
      sourceRef: readString(record, 'sourceRef') ?? 'listing-map',
    };
    entries.push(entry);
    const bucket = byKey.get(listingId) ?? [];
    bucket.push(entry);
    byKey.set(listingId, bucket);
  }

  // Two windows of the SAME listing must not overlap: that would be two identities for one key.
  for (const [key, bucket] of byKey) {
    const sorted = [...bucket].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1]!;
      const current = sorted[i]!;
      const previousEnd = previous.effectiveTo ?? '9999-12-31';
      if (current.effectiveFrom <= previousEnd) {
        issues.push(
          issue(file, 'AMBIGUOUS_LISTING', key, `overlapping windows ${previous.effectiveFrom}..${previousEnd} and ${current.effectiveFrom}..`),
        );
      }
    }
  }

  if (issues.length > 0) return { listingMap: null, issues };
  return { listingMap: { schemaVersion: IDENTITY_SCHEMA, entries }, issues };
}

export function validateCorporateActionTable(
  text: string,
  roster: EligibleRoster,
): { table: CorporateActionTable | null; issues: readonly SourceIssue[] } {
  const file = 'corporate-actions.json' as const;
  const issues: SourceIssue[] = [];
  const parsed = parseJson(text, file, issues);
  if (parsed === null) return { table: null, issues };
  const root = asRecord(parsed);
  if (root.schemaVersion !== IDENTITY_SCHEMA) {
    issues.push(issue(file, 'SCHEMA_MISMATCH', file, `expected ${IDENTITY_SCHEMA}`));
    return { table: null, issues };
  }

  const issuerIds = new Set(roster.issuers.map((issuer) => issuer.issuerId));
  const actions: CorporateActionRecord[] = [];
  const seen = new Set<string>();

  for (const [index, raw] of asArray(root.actions).entries()) {
    const record = asRecord(raw);
    const subject = readString(record, 'actionId') ?? `actions[${index}]`;
    const actionId = readString(record, 'actionId');
    const type = readString(record, 'type');
    const effectiveDate = readString(record, 'effectiveDate');
    const subjectIssuerId = readString(record, 'subjectIssuerId');
    if (actionId === null || type === null || effectiveDate === null || subjectIssuerId === null) {
      issues.push(issue(file, 'ACTION_INCOMPLETE', subject, 'actionId, type, effectiveDate and subjectIssuerId are required'));
      continue;
    }
    if (seen.has(actionId)) {
      issues.push(issue(file, 'DUPLICATE_ACTION', subject, 'actionId appears more than once'));
      continue;
    }
    seen.add(actionId);
    if (!CORPORATE_ACTION_TYPES.has(type)) {
      issues.push(issue(file, 'UNKNOWN_ACTION_TYPE', subject, type));
      continue;
    }
    if (!issuerIds.has(subjectIssuerId)) {
      issues.push(issue(file, 'UNKNOWN_ISSUER', subject, `subject issuer ${subjectIssuerId} is not in the roster`));
      continue;
    }
    const adjustmentFactorRaw = record.adjustmentFactor;
    const adjustmentFactor =
      typeof adjustmentFactorRaw === 'number' && Number.isFinite(adjustmentFactorRaw) ? adjustmentFactorRaw : null;
    if (adjustmentFactor !== null && adjustmentFactor <= 0) {
      issues.push(issue(file, 'INVALID_FACTOR', subject, 'adjustmentFactor must be greater than zero'));
      continue;
    }
    const successors = asArray(record.successors).map((successor) => {
      const entry = asRecord(successor);
      return {
        issuerId: readString(entry, 'issuerId') ?? '',
        ratio: typeof entry.ratio === 'number' && Number.isFinite(entry.ratio) ? entry.ratio : Number.NaN,
      };
    });
    if (successors.some((successor) => successor.issuerId === '' || !Number.isFinite(successor.ratio))) {
      issues.push(issue(file, 'SUCCESSOR_INVALID', subject, 'each successor needs an issuerId and a numeric ratio'));
      continue;
    }
    if (successors.length > 0) {
      const total = successors.reduce((sum, successor) => sum + successor.ratio, 0);
      if (Math.abs(total - 1) > 1e-6) {
        issues.push(issue(file, 'SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE', subject, `ratios sum to ${total}, expected 1`));
        continue;
      }
    }
    if ((type === 'MERGER' || type === 'DEMERGER') && successors.length === 0) {
      issues.push(issue(file, 'SUCCESSORS_REQUIRED', subject, `${type} requires successor mappings`));
      continue;
    }
    actions.push({
      actionId,
      type: type as CorporateActionRecord['type'],
      effectiveDate,
      subjectIssuerId,
      subjectSecurityId: readString(record, 'subjectSecurityId'),
      perShareComparable: record.perShareComparable === true,
      adjustmentFactor,
      factorBasis: readString(record, 'factorBasis'),
      successors,
      sourceRef: readString(record, 'sourceRef') ?? 'corporate-actions',
    });
  }

  if (issues.length > 0) return { table: null, issues };
  return { table: { schemaVersion: IDENTITY_SCHEMA, actions }, issues };
}

export interface IdentitySourceTexts {
  readonly roster: string;
  readonly listingMap: string;
  readonly corporateActions: string;
  readonly dataClass?: IdentitySources['rosterDataClass'];
}

/** Validate and version all three files. Any issue in any file rejects the whole set. */
export function loadIdentitySources(texts: IdentitySourceTexts): SourceLoadResult {
  const issues: SourceIssue[] = [];
  const rosterResult = validateRoster(texts.roster);
  issues.push(...rosterResult.issues);
  if (rosterResult.roster === null) return { available: false, issues };
  const roster = rosterResult.roster;

  const listingResult = validateListingMap(texts.listingMap, roster);
  issues.push(...listingResult.issues);
  const actionResult = validateCorporateActionTable(texts.corporateActions, roster);
  issues.push(...actionResult.issues);
  if (listingResult.listingMap === null || actionResult.table === null) return { available: false, issues };

  const rosterDigest = digestOf(roster);
  const listingMapDigest = digestOf(listingResult.listingMap);
  const corporateActionTableDigest = digestOf(actionResult.table);

  return {
    available: true,
    sources: {
      roster,
      listingMap: listingResult.listingMap,
      corporateActionTable: actionResult.table,
      versions: {
        rosterVersion: rosterDigest,
        listingMapVersion: listingMapDigest,
        corporateActionTableVersion: corporateActionTableDigest,
        rosterDigest,
        listingMapDigest,
        corporateActionTableDigest,
      },
      rosterDataClass:
        texts.dataClass ??
        (/synthetic/i.test(roster.rosterLabel) ? 'SYNTHETIC_FIXTURE' : 'OPERATOR_SUPPLIED'),
    },
  };
}

export const IDENTITY_DIR_SUBDIR = 'identity' as const;
export const IDENTITY_FILE_NAMES = Object.freeze({
  roster: 'eligible-roster.json',
  listingMap: 'listing-map.json',
  corporateActions: 'corporate-actions.json',
});

/** `${IIPS_DATA_DIR}/investment/identity`. */
export function resolveIdentityDir(dataRoot?: string): string {
  const root = dataRoot ?? process.env.IIPS_DATA_DIR ?? resolve(process.cwd(), '.iips-data');
  return join(resolve(root), 'investment', IDENTITY_DIR_SUBDIR);
}

/** Load the three identity files from disk. A missing file is a bounded, reported failure. */
export function loadIdentitySourcesFromDir(dir: string = resolveIdentityDir()): SourceLoadResult {
  const paths = {
    roster: join(dir, IDENTITY_FILE_NAMES.roster),
    listingMap: join(dir, IDENTITY_FILE_NAMES.listingMap),
    corporateActions: join(dir, IDENTITY_FILE_NAMES.corporateActions),
  };
  const missing = Object.entries(paths)
    .filter(([, path]) => !existsSync(path))
    .map(([key]) => key);
  if (missing.length > 0) {
    return {
      available: false,
      issues: [
        issue('eligible-roster.json', 'IDENTITY_SOURCE_MISSING', dir, `missing file(s): ${missing.join(', ')}`),
      ],
    };
  }
  return loadIdentitySources({
    roster: readFileSync(paths.roster, 'utf8'),
    listingMap: readFileSync(paths.listingMap, 'utf8'),
    corporateActions: readFileSync(paths.corporateActions, 'utf8'),
  });
}
