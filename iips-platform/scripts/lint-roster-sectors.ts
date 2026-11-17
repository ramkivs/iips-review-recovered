/**
 * IID Stage 4 — `S4-R7`: a static lint over every committed hand-authored issuer roster.
 *
 * THE GAP THIS CLOSES. `S3-D1` put `assertValidIssuerSectors` at the point the ingestion CLI reads a
 * roster, and `G-7` put the same vocabulary on the coverage read path. Neither answers `G-14`'s literal
 * complaint — *"two sector vocabularies, no lint"* — because both are runtime guards: they fire when
 * somebody ingests, not when somebody commits. A hand-authored roster carrying `"consumer"` can sit in
 * the repository indefinitely, and the next build that reaches it measures nothing for that sector while
 * reporting success. This lint moves the same check to repository time.
 *
 * ONE AUTHORITY. Every sector decision here is `findInvalidIssuerSectors` — the classifier the ingestion
 * guard and the read path already use. This file introduces no vocabulary, no normalisation and no
 * second opinion: it discovers files, calls that function, and reports what it returned.
 *
 * DISCOVERY, NOT A LIST. Rosters are found by walking the checkout for the two committed hand-authored
 * roster filenames. Nothing is enumerated by bundle name, so a newly committed roster is covered the
 * moment it lands — which is the entire point, since the previous three-bundle test could not see the
 * S4-R3 refresh rosters at all. The walk deliberately does not consult the Git index: a shallow or
 * partially restored checkout must not silently shrink the population. In a clean checkout the working
 * tree *is* the committed set.
 *
 * TEST FIXTURES are excluded from the gated population by directory name, and every exclusion is
 * printed with its count, so "excluded" is never silent. Fixtures live under a `fixtures` directory,
 * never beside admitted evidence.
 *
 * READ-ONLY. This script only reads. It never writes, repairs, trims, case-folds or re-serialises a
 * roster — a lint that rewrote the evidence it checks would destroy the thing it is meant to protect.
 *
 *   tsx scripts/lint-roster-sectors.ts [--root <dir>] [--json]
 *
 * Exit codes: `0` every roster valid; `1` an off-vocabulary sector or an unreadable/malformed roster;
 * `2` usage error. `--root` exists so tests can point the same code path at a fixture tree.
 */
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { SECTOR_NAMES } from '../src/investment/contracts/operatingMetrics';
import {
  findInvalidIssuerSectors,
  type InvalidIssuerSector,
  type UnvalidatedIssuer,
} from '../src/investment/ingestion/sectorValidation';

/**
 * The committed hand-authored roster filenames.
 *
 * `roster.json` is the ingestion input roster (`cli/ingest.ts` requires exactly this name).
 * `eligible-roster.json` is the hand-authored identity roster. Both carry `issuers[].sector`, both are
 * written by a human, and both are gated here by the same authority. The identity loader substitutes
 * `UNCLASSIFIED` for a *missing* sector at read time; that is a loader fallback, not a licence for a
 * committed roster to carry an off-vocabulary value, so no exception is carved out for it.
 */
export const ROSTER_FILE_NAMES: readonly string[] = Object.freeze(['roster.json', 'eligible-roster.json']);

/** Directories never walked: VCS internals, installed dependencies, and synthetic test fixtures. */
export const SKIPPED_DIRECTORIES: readonly string[] = Object.freeze(['.git', 'node_modules', 'fixtures']);

export type RosterKind = 'ingestion' | 'identity';

export interface DiscoveredRosters {
  /** Repository-relative, forward-slashed, sorted. */
  readonly rosters: readonly string[];
  /** Fixture rosters found and deliberately not gated. Reported, never silently dropped. */
  readonly excludedFixtures: readonly string[];
}

export interface RosterFileResult {
  readonly path: string;
  readonly kind: RosterKind;
  readonly issuerCount: number;
  /** Set when the file cannot be parsed or has no `issuers` array; a fail, not a skip. */
  readonly structuralError: string | null;
  readonly invalid: readonly InvalidIssuerSector[];
  readonly ok: boolean;
}

export interface RosterLintReport {
  readonly root: string;
  readonly files: readonly RosterFileResult[];
  readonly excludedFixtures: readonly string[];
  readonly checked: number;
  readonly failed: number;
  readonly ok: boolean;
}

function toPosix(path: string): string {
  return sep === '/' ? path : path.split(sep).join('/');
}

/**
 * Deterministic depth-first walk: entries sorted at every level, symlinks never followed (`lstat`), so
 * the traversal cannot loop or escape the root. Once inside a `fixtures` tree every roster found is
 * collected as excluded rather than gated.
 */
function walk(
  absoluteDir: string,
  root: string,
  inFixtures: boolean,
  rosters: string[],
  excluded: string[],
): void {
  for (const entry of readdirSync(absoluteDir).sort()) {
    const absolute = join(absoluteDir, entry);
    const stats = lstatSync(absolute);
    if (stats.isDirectory()) {
      if (!inFixtures && entry !== 'fixtures' && SKIPPED_DIRECTORIES.includes(entry)) continue;
      walk(absolute, root, inFixtures || entry === 'fixtures', rosters, excluded);
      continue;
    }
    if (stats.isFile() && ROSTER_FILE_NAMES.includes(entry)) {
      (inFixtures ? excluded : rosters).push(toPosix(relative(root, absolute)));
    }
  }
}

/**
 * Every committed hand-authored roster under `root`, plus the fixture rosters deliberately not gated.
 *
 * Both lists are sorted, so two runs over the same tree produce byte-identical output.
 */
export function discoverRosters(root: string): DiscoveredRosters {
  const base = resolve(root);
  const rosters: string[] = [];
  const excludedFixtures: string[] = [];
  walk(base, base, false, rosters, excludedFixtures);
  return { rosters: rosters.sort(), excludedFixtures: excludedFixtures.sort() };
}

function kindOf(path: string): RosterKind {
  return path.endsWith('/eligible-roster.json') || path === 'eligible-roster.json' ? 'identity' : 'ingestion';
}

/** Read one roster and classify its sectors. Never writes; a read/parse failure is a failure, not a skip. */
export function lintRosterFile(root: string, path: string): RosterFileResult {
  const kind = kindOf(path);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(join(resolve(root), path), 'utf8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { path, kind, issuerCount: 0, structuralError: `cannot read or parse roster: ${message}`, invalid: [], ok: false };
  }
  const issuers = (parsed as { readonly issuers?: unknown } | null)?.issuers;
  if (!Array.isArray(issuers)) {
    return {
      path, kind, issuerCount: 0,
      structuralError: '"issuers" must be an array; the roster cannot be classified',
      invalid: [], ok: false,
    };
  }
  const invalid = findInvalidIssuerSectors(issuers as readonly UnvalidatedIssuer[]);
  return { path, kind, issuerCount: issuers.length, structuralError: null, invalid, ok: invalid.length === 0 };
}

/** Lint every discovered roster. Pure with respect to the tree: reads only. */
export function lintRosters(root: string): RosterLintReport {
  const base = resolve(root);
  const { rosters, excludedFixtures } = discoverRosters(base);
  const files = rosters.map((path) => lintRosterFile(base, path));
  const failed = files.filter((file) => !file.ok).length;
  return { root: base, files, excludedFixtures, checked: files.length, failed, ok: failed === 0 };
}

function renderInvalid(entry: InvalidIssuerSector): string {
  const hint = entry.suggestion === null
    ? ''
    : ` — ${entry.suggestion.correction}: the canonical value is ${JSON.stringify(entry.suggestion.sector)}`;
  return `    [${entry.index}] ${entry.issuerId} (${entry.legalName}): sector is ${entry.received} — ${entry.reason}${hint}`;
}

/** Human-readable, deterministic output. Offending file, issuer and value are always named. */
export function renderReport(report: RosterLintReport): string {
  const lines: string[] = ['S4-R7 — static roster vocabulary lint', `root: ${report.root}`];
  for (const file of report.files) {
    if (file.ok) {
      lines.push(`  ok    ${file.path} (${file.kind}, ${file.issuerCount} issuer(s))`);
      continue;
    }
    lines.push(`  FAIL  ${file.path} (${file.kind})`);
    if (file.structuralError !== null) lines.push(`    ${file.structuralError}`);
    for (const entry of file.invalid) lines.push(renderInvalid(entry));
  }
  lines.push(
    `excluded test fixtures: ${report.excludedFixtures.length}` +
    (report.excludedFixtures.length === 0 ? '' : ` (${report.excludedFixtures.join(', ')})`),
  );
  lines.push(`rosters checked: ${report.checked}; failed: ${report.failed}`);
  if (!report.ok) {
    lines.push(
      'Sector names are exact and case-sensitive, and are never trimmed, case-folded or otherwise normalised.',
      `The ${SECTOR_NAMES.length} valid values are: ${SECTOR_NAMES.join(', ')}`,
      'No roster was modified by this lint.',
      'RESULT: FAIL',
    );
  } else {
    lines.push('No roster was modified by this lint.', 'RESULT: PASS');
  }
  return lines.join('\n');
}

/** CLI entry point. Returns the process exit code; performs no writes. */
export function main(argv: readonly string[]): number {
  let root = resolve(__dirname, '../..');
  let json = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (arg === '--json') { json = true; continue; }
    if (arg === '--root') {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) {
        process.stderr.write('usage: lint-roster-sectors [--root <dir>] [--json] — --root needs a directory\n');
        return 2;
      }
      root = resolve(value);
      index += 1;
      continue;
    }
    process.stderr.write(`usage: lint-roster-sectors [--root <dir>] [--json] — unknown argument ${arg}\n`);
    return 2;
  }
  let report: RosterLintReport;
  try {
    report = lintRosters(root);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`cannot scan ${root}: ${message}\n`);
    return 2;
  }
  const rendered = json ? JSON.stringify(report, null, 2) : renderReport(report);
  if (report.ok) {
    process.stdout.write(`${rendered}\n`);
    return 0;
  }
  process.stderr.write(`${rendered}\n`);
  return 1;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
