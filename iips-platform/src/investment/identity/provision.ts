/**
 * IID Stage 2 — identity source provisioning.
 *
 * The three identity files (`eligible-roster.json`, `listing-map.json`, `corporate-actions.json`) are READ by the
 * whole IID stack — `loadIdentitySourcesFromDir` here, `/api/investment/coverage`, the readiness finding
 * `identity-files`, `generate-investment-artifacts` — and until now nothing in the repository ever WROTE them.
 * This module is that missing writer. It adds no identity rule of its own: every schema, key and state check is
 * delegated to the existing validators in `sources.ts`, so a set this module publishes is by construction a set the
 * runtime will load.
 *
 * WHAT IT DOES. It takes N operator-supplied identity source sets (each a directory holding the three files),
 * merges them into one set, validates the merged set through the existing loader, and publishes it into
 * `<dataRoot>/investment/identity` through a staging directory with rollback.
 *
 * WHAT IT NEVER DOES.
 *   - It never invents an issuer, security, listing or corporate action. Every record in the merged set is a record
 *     some source set already declared, byte-for-byte: the merge concatenates RAW parsed records, so an optional
 *     field a source omitted stays omitted instead of being frozen into the loader's default and republished as
 *     though the operator had asserted it.
 *   - It never publishes a synthetic fixture as operational data. A source whose roster self-classifies as
 *     `SYNTHETIC_FIXTURE` (its `rosterLabel` says so) is refused, and the composed label is checked so the merged
 *     set cannot acquire that classification by accident.
 *   - It never merges two answers to one identity. Two source sets declaring the same `issuerId` IDENTICALLY are a
 *     duplicate; declaring it DIFFERENTLY is a conflict. Both are refused and both name the directories involved,
 *     because choosing between two rosters is the operator's call, not this build's (the same distinction
 *     `ingestion/multiInput.ts` draws for dataset bundles).
 *   - It never writes outside `<dataRoot>/investment/identity`, and never leaves a half-written set behind: files
 *     are staged whole, verified after the swap, and restored from the previous copy if verification fails.
 *
 * No network calls of any kind. Reads the given source directories; writes only the governed identity directory
 * and its two sibling marker directories.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { canonicalize, sha256Hex } from '../fundamentals/canonical';
import { PREVIOUS_MARKER_SUFFIX, STAGING_MARKER_SUFFIX } from '../ingestion/writer';
import {
  IDENTITY_DIR_SUBDIR,
  IDENTITY_FILE_NAMES,
  loadIdentitySources,
  loadIdentitySourcesFromDir,
  resolveIdentityDir,
  type IdentitySourceTexts,
  type SourceIssue,
  type SourceLoadResult,
} from './sources';
import {
  IDENTITY_SCHEMA,
  type IdentityObservation,
  type ResolutionState,
} from './types';
import { listingParts } from '../contracts/ids';
import {
  buildFinancialCoverageDisclosure,
  computeIdentityCoverage,
  type FinancialCoverageDisclosure,
} from './coverage';

export const PROVISION_REPORT_VERSION = 1 as const;

/** The three identity files, in the order they are staged and published. */
export const PROVISION_FILE_KEYS = ['roster', 'listingMap', 'corporateActions'] as const;
export type ProvisionFileKey = (typeof PROVISION_FILE_KEYS)[number];

export const FILE_NAME_OF_KEY: Readonly<Record<ProvisionFileKey, string>> = Object.freeze({
  roster: IDENTITY_FILE_NAMES.roster,
  listingMap: IDENTITY_FILE_NAMES.listingMap,
  corporateActions: IDENTITY_FILE_NAMES.corporateActions,
});

/**
 * Why a provisioning run was refused. Each code names one way a set of operator-supplied identity sources cannot
 * become one publishable identity set. There is no code for "repaired" or "defaulted": nothing here fixes a source.
 */
export type ProvisionRefusalCode =
  /** A supplied source directory does not exist, so nothing can be read from it. */
  | 'SOURCE_DIR_MISSING'
  /** A supplied directory is not a directory. */
  | 'SOURCE_DIR_NOT_A_DIRECTORY'
  /** The same source directory supplied twice: one source counted as two. */
  | 'DUPLICATE_SOURCE_DIR'
  /** One of the three identity files is absent from a supplied directory. */
  | 'SOURCE_FILE_MISSING'
  /** A file could not be read, or is not valid JSON. */
  | 'SOURCE_FILE_UNREADABLE'
  /** A file does not declare `IIPS_INVESTMENT_IDENTITY_V1`. */
  | 'SOURCE_SCHEMA_MISMATCH'
  /** The existing validators rejected a source set. Carries their issues verbatim. */
  | 'SOURCE_INVALID'
  /** A source roster self-classifies as synthetic, so it is not operational data. */
  | 'SYNTHETIC_SOURCE_REFUSED'
  /** A record has no identity key, so it cannot be deduplicated, referenced or traced. */
  | 'MISSING_IDENTITY'
  /** The same `issuerId` declared by two source sets, identically. */
  | 'DUPLICATE_ISSUER_RECORD'
  /** The same `issuerId` declared by two source sets, differently. */
  | 'CONFLICTING_ISSUER_RECORD'
  /** The same `securityId` declared by two source sets, identically. */
  | 'DUPLICATE_SECURITY_RECORD'
  /** The same `securityId` declared by two source sets, differently. */
  | 'CONFLICTING_SECURITY_RECORD'
  /** The same ISIN claimed for two different `securityId`s across source sets. */
  | 'CONFLICTING_ISIN_CLAIM'
  /** The same listing window declared by two source sets, identically. */
  | 'DUPLICATE_LISTING_RECORD'
  /** The same listing window declared by two source sets, differently. */
  | 'CONFLICTING_LISTING_RECORD'
  /** The same `actionId` declared by two source sets, identically. */
  | 'DUPLICATE_ACTION_RECORD'
  /** The same `actionId` declared by two source sets, differently. */
  | 'CONFLICTING_ACTION_RECORD'
  /** Corporate actions recorded under a key the validator does not read, so they would be silently dropped. */
  | 'CORPORATE_ACTIONS_UNDER_UNREAD_KEY'
  /** The merged set fails the existing validators, even though every source passed on its own. */
  | 'MERGED_SET_INVALID'
  /** The merged set names no issuer, so it cannot support any coverage claim. */
  | 'NOTHING_TO_PUBLISH'
  /** The composed roster label would classify the merged set as synthetic. */
  | 'COMPOSED_LABEL_UNSAFE'
  /** The target is not `<dataRoot>/investment/identity`, so it is not the governed location. */
  | 'TARGET_OUTSIDE_GOVERNED_IDENTITY_DIR'
  /** A target file changed on disk between planning and publication. */
  | 'TARGET_CHANGED_UNDERNEATH'
  /** Publication could not be completed; the previous set was restored. */
  | 'PUBLICATION_FAILED'
  /** The published set did not re-validate after the swap; the previous set was restored. */
  | 'POST_PUBLISH_VERIFICATION_FAILED';

export interface ProvisionRefusal {
  readonly code: ProvisionRefusalCode;
  /** The identity the refusal is about: a directory, a file path, an `issuerId`, a `listingId`. */
  readonly subject: string;
  readonly detail: string;
  /** The source directories involved, in the order supplied. Empty for target-side refusals. */
  readonly sources: readonly string[];
}

function refusal(
  code: ProvisionRefusalCode,
  subject: string,
  detail: string,
  sources: readonly string[] = [],
): ProvisionRefusal {
  return { code, subject, detail, sources };
}

/** Render the existing validators' issues so a refusal names the file, code and subject the loader reported. */
function describeIssues(issues: readonly SourceIssue[]): string {
  return issues.map((issue) => `${issue.file} ${issue.code} [${issue.subject}] ${issue.detail}`).join(' | ');
}

/* ------------------------------------------------------------------ labelling */

/**
 * Directory names that describe the identity LAYOUT rather than the source, so they carry no provenance. Every
 * admitted bundle holds its identity triple in a directory called `identity`, sometimes under `ingest-input`, which
 * would label three different sources identically and make the composed roster label useless.
 */
const GENERIC_SOURCE_SEGMENTS: ReadonlySet<string> = new Set([
  'identity',
  'identity-sources',
  'ingest-input',
  'ingest',
  'input',
]);

/**
 * The bundle a source directory belongs to: its own name, with generic layout segments stripped from the end.
 * `.../WI7-CONSUMER-MARICO-2026-11-07/ingest-input/identity` becomes `WI7-CONSUMER-MARICO-2026-11-07`.
 */
export function sourceBundleLabel(dir: string): string {
  const resolved = resolve(dir);
  const segments = resolved.split(/[\\/]/).filter((segment) => segment !== '');
  while (segments.length > 1 && GENERIC_SOURCE_SEGMENTS.has(segments[segments.length - 1]!)) segments.pop();
  return segments[segments.length - 1] ?? resolved;
}

/** The longest common ancestor directory of a set of absolute paths. */
function commonAncestor(dirs: readonly string[]): string {
  const split = dirs.map((dir) => resolve(dir).split(/[\\/]/));
  const first = split[0] ?? [];
  let depth = 0;
  while (depth < first.length) {
    const segment = first[depth];
    if (!split.every((parts) => parts[depth] === segment)) break;
    depth += 1;
  }
  const joined = first.slice(0, depth).join('/');
  return joined === '' ? '/' : joined;
}

/**
 * Give every source set a label that distinguishes it. Bundle names normally do; when two sources share one, fall
 * back to each path relative to their common ancestor, which is unique unless the same directory was supplied twice
 * (refused separately). A label is how a record is traced back to its source, so an ambiguous one is a real defect.
 */
export function withUniqueLabels(sets: readonly IdentitySourceSet[]): readonly IdentitySourceSet[] {
  const counts = new Map<string, number>();
  for (const set of sets) counts.set(set.label, (counts.get(set.label) ?? 0) + 1);
  const collided = [...counts.entries()].some(([, count]) => count > 1);
  if (!collided) return sets;
  const root = commonAncestor(sets.map((set) => set.dir));
  return sets.map((set) => {
    const path = resolve(set.dir);
    const rel = relative(root, path);
    return { ...set, label: rel === '' ? path : rel.split(/[\\/]/).join('/') };
  });
}

/* ------------------------------------------------------------------ reading */

export interface IdentitySourceFile {
  readonly key: ProvisionFileKey;
  readonly fileName: string;
  readonly path: string;
  readonly bytes: number;
  /** SHA-256 over the file's exact bytes, as bare hex. */
  readonly sha256: string;
  readonly text: string;
}

/** One operator-supplied directory holding the three identity files, read and parsed but not yet merged. */
export interface IdentitySourceSet {
  readonly dir: string;
  /** The directory's own name, used in every report line so a record is traceable to its source. */
  readonly label: string;
  readonly files: Readonly<Record<ProvisionFileKey, IdentitySourceFile>>;
  readonly texts: IdentitySourceTexts;
  /** The source's own `rosterLabel`, exactly as written. */
  readonly rosterLabel: string;
  /** RAW parsed records: no defaults applied, so nothing is asserted that the operator did not write. */
  readonly issuers: readonly unknown[];
  readonly securities: readonly unknown[];
  readonly listings: readonly unknown[];
  readonly actions: readonly unknown[];
  /** Data classes the loader would derive for this source on its own. */
  readonly dataClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED';
  /** Non-empty arrays found under a root key the validators do not read, so their records would vanish. */
  readonly unreadRecordArrays: readonly { readonly file: string; readonly key: string; readonly count: number }[];
}

export type SourceSetReadResult =
  | { readonly ok: true; readonly set: IdentitySourceSet }
  | { readonly ok: false; readonly refusals: readonly ProvisionRefusal[] };

function asRecordOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asRecordArray(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? (value as readonly unknown[]) : [];
}

/** The root keys each validator actually reads, so an unread key holding records can be reported. */
const READ_ROOT_KEYS: Readonly<Record<ProvisionFileKey, readonly string[]>> = Object.freeze({
  roster: ['schemaVersion', 'rosterLabel', 'issuers', 'securities'],
  listingMap: ['schemaVersion', 'entries'],
  corporateActions: ['schemaVersion', 'actions'],
});

/**
 * Read one identity source directory.
 *
 * Fail-closed and total: a directory that is missing a file, holds unreadable JSON, or declares the wrong schema
 * yields refusals and no set. Digests are computed here over the exact bytes read, never taken from any manifest.
 */
export function readIdentitySourceSet(dir: string): SourceSetReadResult {
  const refusals: ProvisionRefusal[] = [];
  if (!existsSync(dir)) {
    return { ok: false, refusals: [refusal('SOURCE_DIR_MISSING', dir, 'this identity source directory does not exist')] };
  }
  if (!statSync(dir).isDirectory()) {
    return { ok: false, refusals: [refusal('SOURCE_DIR_NOT_A_DIRECTORY', dir, 'this identity source path is not a directory')] };
  }

  const files = {} as Record<ProvisionFileKey, IdentitySourceFile>;
  const texts = {} as { roster: string; listingMap: string; corporateActions: string };
  const parsed = {} as Record<ProvisionFileKey, Record<string, unknown> | null>;
  const missing: string[] = [];

  for (const key of PROVISION_FILE_KEYS) {
    const fileName = FILE_NAME_OF_KEY[key];
    const path = join(dir, fileName);
    if (!existsSync(path)) {
      missing.push(fileName);
      continue;
    }
    let text: string;
    try {
      text = readFileSync(path, 'utf8');
    } catch (error) {
      refusals.push(
        refusal('SOURCE_FILE_UNREADABLE', path, `could not be read: ${error instanceof Error ? error.message : String(error)}`, [dir]),
      );
      continue;
    }
    const bytes = Buffer.byteLength(text, 'utf8');
    files[key] = { key, fileName, path, bytes, sha256: sha256Hex(text), text };
    texts[key] = text;

    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch (error) {
      refusals.push(
        refusal('SOURCE_FILE_UNREADABLE', path, `is not valid JSON: ${error instanceof Error ? error.message : String(error)}`, [dir]),
      );
      parsed[key] = null;
      continue;
    }
    const root = asRecordOrNull(value);
    if (root === null) {
      refusals.push(refusal('SOURCE_FILE_UNREADABLE', path, 'is not a JSON object', [dir]));
      parsed[key] = null;
      continue;
    }
    if (root.schemaVersion !== IDENTITY_SCHEMA) {
      refusals.push(
        refusal(
          'SOURCE_SCHEMA_MISMATCH',
          path,
          `declares schemaVersion ${JSON.stringify(root.schemaVersion ?? null)}; expected ${IDENTITY_SCHEMA}`,
          [dir],
        ),
      );
    }
    parsed[key] = root;
  }

  if (missing.length > 0) {
    refusals.push(refusal('SOURCE_FILE_MISSING', dir, `missing identity file(s): ${missing.join(', ')}`, [dir]));
  }
  if (refusals.length > 0) return { ok: false, refusals };

  const rosterRoot = parsed.roster!;
  const listingRoot = parsed.listingMap!;
  const actionsRoot = parsed.corporateActions!;

  // Any array under a root key the validators do not read is a place real records could be hiding. Reporting it is
  // what stops a corporate action written under `entries` from being published away as "no corporate actions".
  const unreadRecordArrays: { file: string; key: string; count: number }[] = [];
  for (const key of PROVISION_FILE_KEYS) {
    const root = parsed[key]!;
    const read = READ_ROOT_KEYS[key];
    for (const [rootKey, value] of Object.entries(root)) {
      if (read.includes(rootKey)) continue;
      if (!Array.isArray(value)) continue;
      if (value.length === 0) continue;
      unreadRecordArrays.push({ file: FILE_NAME_OF_KEY[key], key: rootKey, count: value.length });
    }
  }
  for (const found of unreadRecordArrays) {
    refusals.push(
      refusal(
        'CORPORATE_ACTIONS_UNDER_UNREAD_KEY',
        join(dir, found.file),
        `holds ${found.count} record(s) under "${found.key}", which the ${IDENTITY_SCHEMA} validators do not read; `
          + `publishing this file would silently drop them. Re-record them under the key the schema reads.`,
        [dir],
      ),
    );
  }
  if (refusals.length > 0) return { ok: false, refusals };

  // The existing validators decide whether each source is well formed on its own. Their issues are carried
  // verbatim so the operator sees the same codes the runtime would report.
  const perSource: SourceLoadResult = loadIdentitySources(texts);
  if (!perSource.available) {
    return {
      ok: false,
      refusals: [refusal('SOURCE_INVALID', dir, describeIssues(perSource.issues), [dir])],
    };
  }
  if (perSource.sources.rosterDataClass === 'SYNTHETIC_FIXTURE') {
    return {
      ok: false,
      refusals: [
        refusal(
          'SYNTHETIC_SOURCE_REFUSED',
          dir,
          `its roster self-classifies as a synthetic fixture (rosterLabel ${JSON.stringify(perSource.sources.roster.rosterLabel)}). `
            + 'A synthetic fixture is never published as operational identity data.',
          [dir],
        ),
      ],
    };
  }

  return {
    ok: true,
    set: {
      dir,
      label: sourceBundleLabel(dir),
      files,
      texts,
      rosterLabel: perSource.sources.roster.rosterLabel,
      issuers: asRecordArray(rosterRoot.issuers),
      securities: asRecordArray(rosterRoot.securities),
      listings: asRecordArray(listingRoot.entries),
      actions: asRecordArray(actionsRoot.actions),
      dataClass: perSource.sources.rosterDataClass,
      unreadRecordArrays: [],
    },
  };
}

/* ------------------------------------------------------------------ merging */

/** The fields on which two records claiming one identity disagree, as `field: a ≠ b`. */
function differingFields(a: Record<string, unknown>, b: Record<string, unknown>): string[] {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const differences: string[] = [];
  for (const key of keys) {
    if (canonicalize(a[key] ?? null) !== canonicalize(b[key] ?? null)) {
      differences.push(`${key}: ${JSON.stringify(a[key] ?? null)} ≠ ${JSON.stringify(b[key] ?? null)}`);
    }
  }
  return differences;
}

interface Claim {
  readonly label: string;
  readonly fields: Record<string, unknown>;
}

/**
 * Group records claiming one identity across source sets, and refuse every identity claimed more than once.
 *
 * An identical repeat is a DUPLICATE (the identity set must state each identity once); a differing repeat is a
 * CONFLICT (two answers to one identity). The two are reported separately because they ask the operator for
 * different things: drop a redundant source, or reconcile two that disagree.
 */
function crossSourceClaims(
  sets: readonly IdentitySourceSet[],
  pick: (set: IdentitySourceSet) => readonly unknown[],
  idKey: string,
  codes: { readonly missing: ProvisionRefusalCode; readonly duplicate: ProvisionRefusalCode; readonly conflict: ProvisionRefusalCode },
  noun: string,
): ProvisionRefusal[] {
  const claims = new Map<string, Claim[]>();
  const refusals: ProvisionRefusal[] = [];

  for (const set of sets) {
    for (const record of pick(set)) {
      const fields = asRecordOrNull(record);
      if (fields === null) {
        refusals.push(
          refusal('MISSING_IDENTITY', set.dir, `a ${noun} record in this source is not an object, so it cannot be identified`, [set.dir]),
        );
        continue;
      }
      const id = typeof fields[idKey] === 'string' ? (fields[idKey] as string).trim() : '';
      if (id === '') {
        refusals.push(
          refusal(
            'MISSING_IDENTITY',
            set.dir,
            `a ${noun} record in this source has no "${idKey}", so it cannot be identified, deduplicated or traced`,
            [set.dir],
          ),
        );
        continue;
      }
      const bucket = claims.get(id) ?? [];
      bucket.push({ label: set.label, fields });
      claims.set(id, bucket);
    }
  }

  for (const [id, bucket] of claims) {
    if (bucket.length < 2) continue;
    const first = bucket[0]!;
    const differs = bucket.filter((claim) => differingFields(first.fields, claim.fields).length > 0);
    const labels = bucket.map((claim) => claim.label);
    if (differs.length === 0) {
      refusals.push(
        refusal(
          codes.duplicate,
          id,
          `this ${noun} is declared identically by ${bucket.length} source sets (${labels.join(', ')}); `
            + 'the identity set must state it once, so supply it from one source only',
          labels,
        ),
      );
      continue;
    }
    const differences = differingFields(first.fields, differs[0]!.fields);
    refusals.push(
      refusal(
        codes.conflict,
        id,
        `this ${noun} is declared DIFFERENTLY by ${labels.join(', ')} — ${differences.join('; ')}. `
          + 'Two answers to one identity are refused rather than reconciled, because choosing between them is the operator\'s call.',
        labels,
      ),
    );
  }
  return refusals;
}

/** A listing window is identified by the listing plus the window it covers, not by the listing alone. */
function listingWindowKey(fields: Record<string, unknown>): string {
  const listingId = typeof fields.listingId === 'string' ? fields.listingId : '';
  const from = typeof fields.effectiveFrom === 'string' ? fields.effectiveFrom : '';
  const to = fields.effectiveTo === null || fields.effectiveTo === undefined ? '' : String(fields.effectiveTo);
  return `${listingId}|${from}|${to}`;
}

export interface MergedCounts {
  readonly sources: number;
  readonly issuers: number;
  readonly securities: number;
  readonly listings: number;
  readonly actions: number;
}

export interface IdentityMergeResult {
  readonly ok: boolean;
  /** The three merged texts, canonical bytes, or null when anything was refused. */
  readonly candidate: IdentitySourceTexts | null;
  readonly candidateSha256: Readonly<Record<ProvisionFileKey, string>> | null;
  readonly candidateBytes: Readonly<Record<ProvisionFileKey, number>> | null;
  readonly rosterLabel: string | null;
  readonly sourceLabels: readonly string[];
  readonly sourceRosterLabels: readonly string[];
  readonly counts: MergedCounts;
  readonly refusals: readonly ProvisionRefusal[];
  readonly disclosures: readonly string[];
}

/** Canonical published bytes: keys sorted, two-space indent, trailing newline. Byte-stable across runs. */
function serializeIdentityFile(value: unknown): string {
  return `${JSON.stringify(JSON.parse(canonicalize(value)), null, 2)}\n`;
}

/**
 * Merge N operator-supplied identity source sets into one candidate set.
 *
 * The merge is a concatenation of RAW records, never a re-derivation: a field a source omitted stays omitted. The
 * candidate is then handed to the existing loader, so the merged set is held to exactly the standard the runtime
 * applies. A candidate that fails is refused as `MERGED_SET_INVALID` and nothing is published.
 */
export function mergeIdentitySourceSets(sets: readonly IdentitySourceSet[]): IdentityMergeResult {
  const refusals: ProvisionRefusal[] = [];
  const disclosures: string[] = [];
  // Labels are resolved here, where every source is visible, so no report line can name two sources identically.
  const labelled = withUniqueLabels(sets);
  const sourceLabels = labelled.map((set) => set.label);

  if (sets.length === 0) {
    return emptyMerge(
      [],
      [refusal('NOTHING_TO_PUBLISH', '(no sources)', 'no identity source set was supplied, so there is nothing to merge or publish')],
      disclosures,
    );
  }

  // The same directory supplied twice is one source counted as two, which would make every record a duplicate.
  const seenDirs = new Set<string>();
  for (const set of sets) {
    const key = resolve(set.dir);
    if (seenDirs.has(key)) {
      refusals.push(
        refusal('DUPLICATE_SOURCE_DIR', set.dir, 'this identity source directory was supplied more than once, which would count one source as two', [set.dir]),
      );
    }
    seenDirs.add(key);
  }

  refusals.push(
    ...crossSourceClaims(
      labelled,
      (set) => set.issuers,
      'issuerId',
      { missing: 'MISSING_IDENTITY', duplicate: 'DUPLICATE_ISSUER_RECORD', conflict: 'CONFLICTING_ISSUER_RECORD' },
      'issuer',
    ),
    ...crossSourceClaims(
      labelled,
      (set) => set.securities,
      'securityId',
      { missing: 'MISSING_IDENTITY', duplicate: 'DUPLICATE_SECURITY_RECORD', conflict: 'CONFLICTING_SECURITY_RECORD' },
      'security',
    ),
    ...crossSourceClaims(
      labelled,
      (set) => set.actions,
      'actionId',
      { missing: 'MISSING_IDENTITY', duplicate: 'DUPLICATE_ACTION_RECORD', conflict: 'CONFLICTING_ACTION_RECORD' },
      'corporate action',
    ),
  );

  // Listings are keyed by window: the same listing may legitimately appear twice with non-overlapping windows, and
  // the loader's own AMBIGUOUS_LISTING check decides whether two windows collide.
  const listingClaims = new Map<string, Claim[]>();
  for (const set of labelled) {
    for (const record of set.listings) {
      const fields = asRecordOrNull(record);
      if (fields === null || typeof fields.listingId !== 'string' || fields.listingId.trim() === '') {
        refusals.push(
          refusal('MISSING_IDENTITY', set.dir, 'a listing record in this source has no "listingId", so it cannot be identified', [set.dir]),
        );
        continue;
      }
      const key = listingWindowKey(fields);
      const bucket = listingClaims.get(key) ?? [];
      bucket.push({ label: set.label, fields });
      listingClaims.set(key, bucket);
    }
  }
  for (const [key, bucket] of listingClaims) {
    if (bucket.length < 2) continue;
    const first = bucket[0]!;
    const differs = bucket.filter((claim) => differingFields(first.fields, claim.fields).length > 0);
    const labels = bucket.map((claim) => claim.label);
    const listingId = String(first.fields.listingId);
    if (differs.length === 0) {
      refusals.push(
        refusal(
          'DUPLICATE_LISTING_RECORD',
          listingId,
          `this listing window is declared identically by ${labels.join(', ')}; supply it from one source only`,
          labels,
        ),
      );
      continue;
    }
    refusals.push(
      refusal(
        'CONFLICTING_LISTING_RECORD',
        listingId,
        `this listing window (${key}) is declared DIFFERENTLY by ${labels.join(', ')} — `
          + differingFields(first.fields, differs[0]!.fields).join('; '),
        labels,
      ),
    );
  }

  // One ISIN may only ever denote one security, across sources as well as within one.
  const isinClaims = new Map<string, { readonly securityId: string; readonly label: string }[]>();
  for (const set of labelled) {
    for (const record of set.securities) {
      const fields = asRecordOrNull(record);
      if (fields === null) continue;
      const isin = typeof fields.isin === 'string' ? fields.isin.trim().toUpperCase() : '';
      const securityId = typeof fields.securityId === 'string' ? fields.securityId : '';
      if (isin === '' || securityId === '') continue;
      const bucket = isinClaims.get(isin) ?? [];
      bucket.push({ securityId, label: set.label });
      isinClaims.set(isin, bucket);
    }
  }
  for (const [isin, bucket] of isinClaims) {
    const distinct = [...new Set(bucket.map((claim) => claim.securityId))];
    if (distinct.length < 2) continue;
    refusals.push(
      refusal(
        'CONFLICTING_ISIN_CLAIM',
        isin,
        `this ISIN is claimed for more than one security (${distinct.join(', ')}) across ${bucket.map((c) => c.label).join(', ')}`,
        bucket.map((claim) => claim.label),
      ),
    );
  }

  const issuers = labelled.flatMap((set) => set.issuers);
  const securities = labelled.flatMap((set) => set.securities);
  const listings = labelled.flatMap((set) => set.listings);
  const actions = labelled.flatMap((set) => set.actions);

  if (issuers.length === 0) {
    refusals.push(
      refusal(
        'NOTHING_TO_PUBLISH',
        sourceLabels.join(', '),
        'the merged set declares no issuer, so it cannot support any identity or coverage claim',
        sourceLabels,
      ),
    );
  }

  // The composed label states provenance only: which source sets were merged. It is not a company fact, and it must
  // never contain the word that would classify the merged roster as synthetic.
  const rosterLabel =
    `Merged from ${sets.length} operator-supplied identity source set(s): ${sourceLabels.join(', ')}`;
  if (/synthetic/i.test(rosterLabel)) {
    refusals.push(
      refusal(
        'COMPOSED_LABEL_UNSAFE',
        rosterLabel,
        'the composed roster label would classify the merged set as a synthetic fixture; a source directory is named "synthetic"',
        sourceLabels,
      ),
    );
  }

  for (const set of labelled) {
    disclosures.push(`${set.label}: rosterLabel as supplied = ${JSON.stringify(set.rosterLabel)}`);
  }
  if (actions.length === 0) {
    disclosures.push(
      'the merged corporate-action table is EMPTY: no source set declared a corporate action. '
        + 'An empty table is valid and means "no action is claimed", not "no action was checked".',
    );
  }

  if (refusals.length > 0) return emptyMerge(sourceLabels, refusals, disclosures);

  const roster = serializeIdentityFile({ schemaVersion: IDENTITY_SCHEMA, rosterLabel, issuers, securities });
  const listingMap = serializeIdentityFile({ schemaVersion: IDENTITY_SCHEMA, entries: listings });
  const corporateActions = serializeIdentityFile({ schemaVersion: IDENTITY_SCHEMA, actions });
  const candidate: IdentitySourceTexts = { roster, listingMap, corporateActions };

  // The merged set is held to the runtime's own standard: the same loader that will read it from disk.
  const merged: SourceLoadResult = loadIdentitySources(candidate);
  if (!merged.available) {
    refusals.push(
      refusal(
        'MERGED_SET_INVALID',
        sourceLabels.join(', '),
        `every source validated on its own, but the merged set does not: ${describeIssues(merged.issues)}`,
        sourceLabels,
      ),
    );
    return emptyMerge(sourceLabels, refusals, disclosures);
  }
  if (merged.sources.rosterDataClass !== 'OPERATOR_SUPPLIED') {
    refusals.push(
      refusal(
        'SYNTHETIC_SOURCE_REFUSED',
        rosterLabel,
        'the merged set classifies as synthetic, so it is not published as operational identity data',
        sourceLabels,
      ),
    );
    return emptyMerge(sourceLabels, refusals, disclosures);
  }

  return {
    ok: true,
    candidate,
    candidateSha256: {
      roster: sha256Hex(roster),
      listingMap: sha256Hex(listingMap),
      corporateActions: sha256Hex(corporateActions),
    },
    candidateBytes: {
      roster: Buffer.byteLength(roster, 'utf8'),
      listingMap: Buffer.byteLength(listingMap, 'utf8'),
      corporateActions: Buffer.byteLength(corporateActions, 'utf8'),
    },
    rosterLabel,
    sourceLabels,
    sourceRosterLabels: labelled.map((set) => set.rosterLabel),
    counts: {
      sources: sets.length,
      issuers: merged.sources.roster.issuers.length,
      securities: merged.sources.roster.securities.length,
      listings: merged.sources.listingMap.entries.length,
      actions: merged.sources.corporateActionTable.actions.length,
    },
    refusals: [],
    disclosures,
  };
}

function emptyMerge(
  sourceLabels: readonly string[],
  refusals: readonly ProvisionRefusal[],
  disclosures: readonly string[],
): IdentityMergeResult {
  return {
    ok: false,
    candidate: null,
    candidateSha256: null,
    candidateBytes: null,
    rosterLabel: null,
    sourceLabels,
    sourceRosterLabels: [],
    counts: { sources: sourceLabels.length, issuers: 0, securities: 0, listings: 0, actions: 0 },
    refusals,
    disclosures,
  };
}

/* -------------------------------------------------------------- publication */

export type PlannedAction = 'CREATED' | 'REPLACED' | 'UNCHANGED';

export interface PlannedFile {
  readonly key: ProvisionFileKey;
  readonly fileName: string;
  readonly path: string;
  readonly action: PlannedAction;
  readonly candidateSha256: string;
  readonly candidateBytes: number;
  readonly existingSha256: string | null;
  readonly existingBytes: number | null;
}

export interface PublicationPlan {
  readonly targetDir: string;
  readonly governed: boolean;
  readonly files: readonly PlannedFile[];
  readonly refusals: readonly ProvisionRefusal[];
  readonly wouldChange: boolean;
}

/**
 * The governed identity location is `<dataRoot>/investment/identity` for SOME data root. That shape is enforced
 * rather than the literal `C:\iips-data`, so the same guard holds on the Windows host and in a test's temp root,
 * while still refusing any directory that is not the governed one.
 */
export function assertGovernedIdentityDir(targetDir: string): ProvisionRefusal | null {
  const segments = resolve(targetDir)
    .split(/[\\/]/)
    .filter((segment) => segment !== '');
  const last = segments[segments.length - 1] ?? '';
  const secondLast = segments[segments.length - 2] ?? '';
  if (last !== IDENTITY_DIR_SUBDIR || secondLast !== 'investment') {
    return refusal(
      'TARGET_OUTSIDE_GOVERNED_IDENTITY_DIR',
      targetDir,
      `identity sources may only be published to <dataRoot>${join('/', 'investment', IDENTITY_DIR_SUBDIR)}; `
        + `this target ends "${join('/', secondLast, last)}". Nothing was written.`,
    );
  }
  return null;
}

/** The governed identity directory for a data root, computed by the existing resolver. */
export function governedIdentityDir(dataRoot?: string): string {
  return resolveIdentityDir(dataRoot);
}

function readExisting(path: string): { sha256: string; bytes: number } | null {
  if (!existsSync(path)) return null;
  try {
    const text = readFileSync(path, 'utf8');
    return { sha256: sha256Hex(text), bytes: Buffer.byteLength(text, 'utf8') };
  } catch {
    return null;
  }
}

/**
 * Compare a candidate against what is already published. Read-only: nothing is created, opened for write or moved.
 *
 * `UNCHANGED` matters as much as `REPLACED`: re-running over an already-correct set must report that it would not
 * touch the published files, so an operator can run preflight repeatedly without churn.
 */
export function planPublication(options: {
  readonly targetDir: string;
  readonly candidate: IdentitySourceTexts;
  readonly candidateSha256: Readonly<Record<ProvisionFileKey, string>>;
  readonly candidateBytes: Readonly<Record<ProvisionFileKey, number>>;
}): PublicationPlan {
  const targetDir = resolve(options.targetDir);
  const notGoverned = assertGovernedIdentityDir(targetDir);
  const files: PlannedFile[] = [];
  let wouldChange = false;

  for (const key of PROVISION_FILE_KEYS) {
    const fileName = FILE_NAME_OF_KEY[key];
    const path = join(targetDir, fileName);
    const existing = readExisting(path);
    const candidateSha256 = options.candidateSha256[key];
    const action: PlannedAction =
      existing === null ? 'CREATED' : existing.sha256 === candidateSha256 ? 'UNCHANGED' : 'REPLACED';
    if (action !== 'UNCHANGED') wouldChange = true;
    files.push({
      key,
      fileName,
      path,
      action,
      candidateSha256,
      candidateBytes: options.candidateBytes[key],
      existingSha256: existing?.sha256 ?? null,
      existingBytes: existing?.bytes ?? null,
    });
  }

  return {
    targetDir,
    governed: notGoverned === null,
    files,
    refusals: notGoverned === null ? [] : [notGoverned],
    wouldChange,
  };
}

/** The points at which a test can force a publication to fail. Each is a distinct on-disk state. */
export type ProvisionFaultPoint =
  /** While staged files are being written: staging exists and is incomplete, destination untouched. */
  | 'duringStaging'
  /** After the first file has been swapped in: the destination holds a MIXED set. This is the case rollback exists for. */
  | 'afterFirstRename';

export interface PublishedFile {
  readonly key: ProvisionFileKey;
  readonly fileName: string;
  readonly path: string;
  readonly action: PlannedAction;
  readonly sha256: string;
  readonly bytes: number;
}

export interface PublishedVerification {
  readonly available: boolean;
  readonly issues: readonly SourceIssue[];
  readonly rosterVersion: string | null;
  readonly listingMapVersion: string | null;
  readonly corporateActionTableVersion: string | null;
  readonly rosterDataClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | null;
  readonly rosterLabel: string | null;
  readonly issuers: number;
  readonly securities: number;
  readonly listings: number;
  readonly actions: number;
}

export interface PublicationResult {
  readonly published: boolean;
  readonly targetDir: string;
  readonly files: readonly PublishedFile[];
  /** True when an existing published set was moved aside and then discarded after a verified swap. */
  readonly replacedExisting: boolean;
  /** True when a failure was rolled back, so the previously published set is intact. */
  readonly rolledBack: boolean;
  readonly rolledBackDetail: string | null;
  readonly verification: PublishedVerification | null;
  readonly refusals: readonly ProvisionRefusal[];
}

/** Re-read a published identity directory through the existing loader and report what it says. */
export function verifyPublishedIdentityDir(dir: string): PublishedVerification {
  const result = loadIdentitySourcesFromDir(resolve(dir));
  if (!result.available) {
    return {
      available: false,
      issues: result.issues,
      rosterVersion: null,
      listingMapVersion: null,
      corporateActionTableVersion: null,
      rosterDataClass: null,
      rosterLabel: null,
      issuers: 0,
      securities: 0,
      listings: 0,
      actions: 0,
    };
  }
  const sources = result.sources;
  return {
    available: true,
    issues: [],
    rosterVersion: sources.versions.rosterVersion,
    listingMapVersion: sources.versions.listingMapVersion,
    corporateActionTableVersion: sources.versions.corporateActionTableVersion,
    rosterDataClass: sources.rosterDataClass,
    rosterLabel: sources.roster.rosterLabel,
    issuers: sources.roster.issuers.length,
    securities: sources.roster.securities.length,
    listings: sources.listingMap.entries.length,
    actions: sources.corporateActionTable.actions.length,
  };
}

/**
 * Publish a merged candidate into the governed identity directory.
 *
 * The sequence protects an already-valid published set from a partial or failed publication:
 *   1. stage all three files whole in `<target>.iips-staging`
 *   2. move the existing target aside to `<target>.iips-previous`
 *   3. rename each staged file into the target (one rename per file)
 *   4. re-read the target through the existing loader and compare every digest against the candidate
 *   5. on success discard both markers; on ANY failure restore the previous set and report it
 *
 * Step 3 is per-file, so a failure between renames leaves a MIXED directory. That is exactly why step 4 exists and
 * why step 5 restores rather than leaves it: no kernel-level atomic directory replacement is claimed here.
 */
export function publishIdentitySources(options: {
  readonly targetDir: string;
  readonly candidate: IdentitySourceTexts;
  readonly candidateSha256: Readonly<Record<ProvisionFileKey, string>>;
  readonly plan: PublicationPlan;
  readonly fault?: ProvisionFaultPoint;
}): PublicationResult {
  const targetDir = resolve(options.targetDir);
  const staging = `${targetDir}${STAGING_MARKER_SUFFIX}`;
  const previous = `${targetDir}${PREVIOUS_MARKER_SUFFIX}`;

  if (options.plan.refusals.length > 0) {
    return { published: false, targetDir, files: [], replacedExisting: false, rolledBack: false, rolledBackDetail: null, verification: null, refusals: options.plan.refusals };
  }

  const hadExisting = PROVISION_FILE_KEYS.some((key) => existsSync(join(targetDir, FILE_NAME_OF_KEY[key])));

  const rollback = (detail: string, code: ProvisionRefusalCode): PublicationResult => {
    let restored = 'no previously published set existed, so the target was left empty';
    try {
      if (hadExisting && existsSync(previous)) {
        for (const key of PROVISION_FILE_KEYS) {
          const name = FILE_NAME_OF_KEY[key];
          rmSync(join(targetDir, name), { force: true });
          if (existsSync(join(previous, name))) renameSync(join(previous, name), join(targetDir, name));
        }
        restored = `the previously published set was restored from ${previous}`;
      }
      rmSync(previous, { recursive: true, force: true });
    } catch (error) {
      restored = `ROLLBACK ITSELF FAILED (${error instanceof Error ? error.message : String(error)}); ${previous} was left in place for manual recovery`;
    }
    try {
      if (options.fault === undefined) rmSync(staging, { recursive: true, force: true });
    } catch {
      // A staging directory that cannot be removed is reported by the caller's next preflight run, not hidden.
    }
    return {
      published: false,
      targetDir,
      files: [],
      replacedExisting: hadExisting,
      rolledBack: true,
      rolledBackDetail: restored,
      verification: null,
      refusals: [refusal(code, targetDir, detail)],
    };
  };

  try {
    rmSync(staging, { recursive: true, force: true });
    rmSync(previous, { recursive: true, force: true });
    mkdirSync(staging, { recursive: true });
    if (options.fault === 'duringStaging') {
      return rollback('publication was interrupted while staging; staging is incomplete and the target was never touched', 'PUBLICATION_FAILED');
    }
    for (const key of PROVISION_FILE_KEYS) {
      writeFileSync(join(staging, FILE_NAME_OF_KEY[key]), options.candidate[key], 'utf8');
    }

    mkdirSync(targetDir, { recursive: true });
    if (hadExisting) {
      mkdirSync(previous, { recursive: true });
      for (const key of PROVISION_FILE_KEYS) {
        const name = FILE_NAME_OF_KEY[key];
        if (existsSync(join(targetDir, name))) renameSync(join(targetDir, name), join(previous, name));
      }
    }

    const published: PublishedFile[] = [];
    for (const [index, key] of PROVISION_FILE_KEYS.entries()) {
      if (options.fault === 'afterFirstRename' && index === 1) {
        return rollback(
          'publication was interrupted after the first file had been swapped in, leaving a MIXED identity set; '
            + 'a mixed set is never left published',
          'PUBLICATION_FAILED',
        );
      }
      const name = FILE_NAME_OF_KEY[key];
      renameSync(join(staging, name), join(targetDir, name));
      const planned = options.plan.files.find((file) => file.key === key);
      published.push({
        key,
        fileName: name,
        path: join(targetDir, name),
        action: planned?.action ?? 'REPLACED',
        sha256: options.candidateSha256[key],
        bytes: Buffer.byteLength(options.candidate[key], 'utf8'),
      });
    }

    // Verify by re-reading from disk, not by trusting what was just written: the digests must come back from the
    // published bytes, and the existing loader must accept the set as published.
    for (const key of PROVISION_FILE_KEYS) {
      const onDisk = readExisting(join(targetDir, FILE_NAME_OF_KEY[key]));
      if (onDisk === null || onDisk.sha256 !== options.candidateSha256[key]) {
        return rollback(
          `${FILE_NAME_OF_KEY[key]} on disk does not match the candidate digest after publication `
            + `(expected sha256:${options.candidateSha256[key]}, found ${onDisk === null ? 'nothing' : `sha256:${onDisk.sha256}`})`,
          'POST_PUBLISH_VERIFICATION_FAILED',
        );
      }
    }
    const verification = verifyPublishedIdentityDir(targetDir);
    if (!verification.available) {
      return rollback(
        `the published set does not re-validate through the existing identity loader: ${describeIssues(verification.issues)}`,
        'POST_PUBLISH_VERIFICATION_FAILED',
      );
    }

    rmSync(staging, { recursive: true, force: true });
    rmSync(previous, { recursive: true, force: true });
    return {
      published: true,
      targetDir,
      files: published,
      replacedExisting: hadExisting,
      rolledBack: false,
      rolledBackDetail: null,
      verification,
      refusals: [],
    };
  } catch (error) {
    return rollback(
      `publication failed: ${error instanceof Error ? error.message : String(error)}`,
      'PUBLICATION_FAILED',
    );
  }
}

/* --------------------------------------------------------------- verification */

/** Which declared identifier a probe observation exercises. */
export type ResolutionProbeKind = 'DECLARED_ISIN' | 'DECLARED_LISTING';

export interface ResolutionProbeItem {
  readonly observationId: string;
  readonly kind: ResolutionProbeKind;
  /** The identifiers supplied, exactly as the published set declares them. */
  readonly isin: string | null;
  readonly symbol: string | null;
  readonly exchange: string | null;
  readonly series: string | null;
  readonly state: ResolutionState;
  readonly reason: string | null;
  readonly reasonText: string | null;
  readonly issuerId: string | null;
  readonly securityId: string | null;
  readonly listingId: string | null;
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly issuerKeyBasis: 'CIN' | 'EQUITY_ISIN' | null;
}

export interface ResolutionProbe {
  readonly probeVersion: 1;
  /**
   * What this probe is, stated in its own output so it can never be quoted as something it is not: a
   * self-consistency check over the identifiers the published set ITSELF declares. It is not a reading of the
   * operator's holdings, and it says nothing about any portfolio.
   */
  readonly probeClass: 'DECLARED_IDENTIFIER_SELF_CONSISTENCY';
  readonly note: string;
  readonly identityDir: string;
  readonly asOf: string;
  readonly sourcesAvailable: boolean;
  readonly issues: readonly SourceIssue[];
  readonly rosterVersion: string | null;
  readonly listingMapVersion: string | null;
  readonly corporateActionTableVersion: string | null;
  readonly rosterDataClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | null;
  readonly rosterLabel: string | null;
  /** Counts from the production coverage computation over the probe observations. */
  readonly observed: number;
  readonly resolved: number;
  readonly assessable: number;
  readonly unresolved: number;
  readonly stateCounts: Readonly<Record<ResolutionState, number>>;
  readonly issuerKeyConflicts: readonly ResolutionProbeItem[];
  readonly items: readonly ResolutionProbeItem[];
}

const PROBE_NOTE =
  'Every observation here is built from an identifier the published identity set itself declares — one per roster '
  + 'security (ISIN path) and one per listing-map entry (exchange/symbol path). This proves the published set '
  + 'resolves its own identifiers to an issuer through the production resolver; it is NOT a reading of holdings and '
  + 'establishes nothing about any portfolio, watchlist or broker surface.';

/**
 * Verify holding-to-issuer resolution against a PUBLISHED identity directory, using the production resolver and
 * the production coverage computation — not a parallel implementation.
 *
 * Two paths are exercised per identifier set, because they are the two ways a real holding can arrive:
 *   DECLARED_ISIN     isin only                      → security → issuer (resolutionBasis ISIN)
 *   DECLARED_LISTING  exchange + symbol + series     → listing → security → issuer (resolutionBasis EXCHANGE_SYMBOL)
 *
 * An observation is classified as WATCHLIST, never HOLDING, so a probe row cannot be mistaken for a position.
 */
export function probeDeclaredIdentifierResolution(options: {
  readonly identityDir: string;
  readonly asOf: string;
  readonly financialCoverage?: FinancialCoverageDisclosure;
}): ResolutionProbe {
  const identityDir = resolve(options.identityDir);
  const loaded = loadIdentitySourcesFromDir(identityDir);

  if (!loaded.available) {
    return {
      probeVersion: 1,
      probeClass: 'DECLARED_IDENTIFIER_SELF_CONSISTENCY',
      note: PROBE_NOTE,
      identityDir,
      asOf: options.asOf,
      sourcesAvailable: false,
      issues: loaded.issues,
      rosterVersion: null,
      listingMapVersion: null,
      corporateActionTableVersion: null,
      rosterDataClass: null,
      rosterLabel: null,
      observed: 0,
      resolved: 0,
      assessable: 0,
      unresolved: 0,
      stateCounts: zeroStateCounts(),
      issuerKeyConflicts: [],
      items: [],
    };
  }

  const sources = loaded.sources;
  const observations: IdentityObservation[] = [];

  for (const security of sources.roster.securities) {
    observations.push({
      observationId: `probe-isin:${security.securityId}`,
      source: 'WATCHLIST',
      isin: security.isin,
      symbol: null,
      exchange: null,
      series: null,
      cin: null,
      companyIdHint: null,
      displayName: null,
      portfolioId: null,
      quantity: null,
      upstreamStatus: null,
      raw: { isin: security.isin, securityId: security.securityId, declaredBy: 'eligible-roster.json' },
    });
  }

  for (const entry of sources.listingMap.entries) {
    const parts = listingParts(entry.listingId as never);
    observations.push({
      observationId: `probe-listing:${entry.listingId}`,
      source: 'WATCHLIST',
      isin: null,
      symbol: parts.symbol,
      exchange: parts.exchange,
      series: parts.series,
      cin: null,
      companyIdHint: null,
      displayName: null,
      portfolioId: null,
      quantity: null,
      upstreamStatus: null,
      raw: {
        listingId: entry.listingId,
        securityId: entry.securityId,
        declaredBy: 'listing-map.json',
      },
    });
  }

  const report = computeIdentityCoverage({
    observations,
    sources,
    asOf: options.asOf,
    generatedAt: `${options.asOf}T00:00:00.000Z`,
    financialCoverage: options.financialCoverage ?? buildFinancialCoverageDisclosure({}),
  });

  // The identifiers reported per item are the ones THIS PROBE supplied, read back from the observations it built.
  // They are not taken from the binding, whose provenance records digests rather than identifiers.
  const supplied = new Map(observations.map((observation) => [observation.observationId, observation]));
  const items: ResolutionProbeItem[] = report.items.map((item) => {
    const observation = supplied.get(item.observationId);
    return {
    observationId: item.observationId,
    kind: item.observationId.startsWith('probe-listing:') ? 'DECLARED_LISTING' : 'DECLARED_ISIN',
    isin: observation?.isin ?? null,
    symbol: observation?.symbol ?? null,
    exchange: observation?.exchange ?? null,
    series: observation?.series ?? null,
    state: item.state,
    reason: item.reason,
    reasonText: item.reasonText,
    issuerId: item.resolution.issuerId,
    securityId: item.resolution.securityId,
    listingId: item.resolution.listingId,
    resolutionBasis: item.resolution.resolutionBasis,
    issuerKeyBasis: item.binding.issuerKeyBasis,
    };
  });

  const resolved = items.filter((item) => item.state === 'RESOLVED').length;
  const conflicts = items.filter((item) => item.state === 'ISSUER_KEY_CONFLICT');

  return {
    probeVersion: 1,
    probeClass: 'DECLARED_IDENTIFIER_SELF_CONSISTENCY',
    note: PROBE_NOTE,
    identityDir,
    asOf: options.asOf,
    sourcesAvailable: true,
    issues: [],
    rosterVersion: sources.versions.rosterVersion,
    listingMapVersion: sources.versions.listingMapVersion,
    corporateActionTableVersion: sources.versions.corporateActionTableVersion,
    rosterDataClass: sources.rosterDataClass,
    rosterLabel: sources.roster.rosterLabel,
    observed: report.counts.observed,
    resolved,
    assessable: report.counts.assessable,
    unresolved: report.counts.observed - resolved,
    stateCounts: report.counts,
    issuerKeyConflicts: conflicts,
    items,
  };
}

function zeroStateCounts(): Readonly<Record<ResolutionState, number>> {
  const counts = {} as Record<ResolutionState, number>;
  for (const state of [
    'RESOLVED',
    'AMBIGUOUS',
    'UNMATCHED',
    'INELIGIBLE',
    'OUT_OF_SCOPE_SECURITY',
    'STALE_REFERENCE',
    'REJECTED_MALFORMED_ISIN',
    'ISSUER_KEY_CONFLICT',
    'AMBIGUOUS_LISTING',
  ] as const) {
    counts[state] = 0;
  }
  return counts;
}
