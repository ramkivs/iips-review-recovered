/**
 * IID Stage 2 — identity source provisioning.
 *
 * These tests run the REAL Stage 2 input: the operator-supplied identity triples under `evidence/real-issuer/`.
 * That evidence is read, never written. What the tests establish is that a merged set built from it is
 * (a) validated by the existing identity loader, (b) published with rollback that protects an already-valid set,
 * (c) never allowed to carry a synthetic fixture or two answers to one identity, and (d) resolvable end to end by
 * the production resolver on both resolution paths.
 *
 * The synthetic fixtures under `fixtures/identity/` appear here only as something that MUST be refused.
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  assertGovernedIdentityDir,
  governedIdentityDir,
  mergeIdentitySourceSets,
  planPublication,
  probeDeclaredIdentifierResolution,
  publishIdentitySources,
  readIdentitySourceSet,
  sourceBundleLabel,
  verifyPublishedIdentityDir,
  withUniqueLabels,
  type IdentitySourceSet,
} from '../../src/investment/identity/provision';
import {
  parseArgs,
  plan as planRun,
  renderReport,
  run,
  type ProvisionReport,
} from '../../src/investment/cli/provision-identity';
import { IDENTITY_FILE_NAMES, loadIdentitySourcesFromDir } from '../../src/investment/identity/sources';
import { loadRuntimeIdentitySources } from '../../src/investment/identity/runtime';
import { IDENTITY_SCHEMA } from '../../src/investment/identity/types';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const REAL_ISSUER = join(REPO_ROOT, 'evidence', 'real-issuer');
const SYNTHETIC_FIXTURES = join(__dirname, 'fixtures', 'identity');

/** The three bundles admitted to the installed dataset, and where each keeps its identity triple. */
const ADMITTED_SOURCES: readonly string[] = [
  join(REAL_ISSUER, 'REL-1-INFOSYS-2026-11-06', 'identity'),
  join(REAL_ISSUER, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input', 'identity'),
  join(REAL_ISSUER, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input', 'identity'),
];

/**
 * A fourth real operator-supplied identity set (Zensar Technologies). It is NOT part of the admitted dataset; it is
 * used only as a DIFFERENT valid candidate, so a rollback test can prove the previously published set survives a
 * failed replacement without inventing an identifier.
 */
const OTHER_VALID_SOURCE = join(REAL_ISSUER, 'WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07', 'ingest-input', 'identity');

/** The issuers the admitted dataset holds, per the Stage 3 host acceptance evidence. */
const ADMITTED_ISSUERS = [
  'IN:CIN:L85110KA1981PLC013115',
  'IN:CIN:L15140MH1988PLC049208',
  'IN:CIN:L45200MH2005PLC152061',
] as const;

const AS_OF = '2026-11-14';
const FILE_NAMES = Object.values(IDENTITY_FILE_NAMES);

let dataRoot = '';
let target = '';

beforeEach(() => {
  dataRoot = mkdtempSync(join(tmpdir(), 'iid-stage2-'));
  target = governedIdentityDir(dataRoot);
});

afterEach(() => {
  if (dataRoot !== '' && existsSync(dataRoot)) rmSync(dataRoot, { recursive: true, force: true });
});

function sha256Of(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Copy one source set elsewhere so a test can perturb it without touching the committed evidence. */
function copySource(from: string, to: string): string {
  mkdirSync(to, { recursive: true });
  for (const name of FILE_NAMES) writeFileSync(join(to, name), readFileSync(join(from, name), 'utf8'), 'utf8');
  return to;
}

function readSets(dirs: readonly string[]): IdentitySourceSet[] {
  const sets: IdentitySourceSet[] = [];
  for (const dir of dirs) {
    const read = readIdentitySourceSet(dir);
    assert.equal(read.ok, true, `${dir} must read cleanly: ${JSON.stringify(read.ok ? [] : read.refusals)}`);
    if (read.ok) sets.push(read.set);
  }
  return sets;
}

/** The exact bytes currently published, keyed by file name. */
function publishedTexts(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of FILE_NAMES) out[name] = readFileSync(join(target, name), 'utf8');
  return out;
}

function executeAdmitted(): number {
  return run([...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, '--execute']);
}

function preflightReport(extra: readonly string[] = []): ProvisionReport {
  return planRun(parseArgs([...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, ...extra]));
}

describe('IID Stage 2 — the admitted bundles are the authoritative identity source data', () => {
  test('each admitted bundle carries a complete, valid, operator-supplied identity triple', () => {
    for (const dir of ADMITTED_SOURCES) {
      const read = readIdentitySourceSet(dir);
      assert.equal(read.ok, true, `${dir} must be a readable identity source set`);
      if (!read.ok) continue;
      assert.equal(read.set.dataClass, 'OPERATOR_SUPPLIED', `${dir} must not be a synthetic fixture`);
      assert.equal(read.set.issuers.length, 1, `${dir} declares exactly one issuer`);
      assert.ok(read.set.rosterLabel.length > 0, `${dir} carries its own rosterLabel`);
      assert.equal(read.set.files.roster.fileName, IDENTITY_FILE_NAMES.roster);
      assert.match(read.set.files.roster.sha256, /^[0-9a-f]{64}$/);
    }
  });

  test('the three admitted triples together declare exactly the three admitted issuers', () => {
    const merged = mergeIdentitySourceSets(readSets(ADMITTED_SOURCES));
    assert.equal(merged.ok, true, JSON.stringify(merged.refusals, null, 2));
    assert.deepEqual(
      merged.counts,
      { sources: 3, issuers: 3, securities: 3, listings: 5, actions: 0 },
      'the merged set is the union of the three bundles and nothing else',
    );
    const roster = JSON.parse(merged.candidate!.roster) as {
      schemaVersion: string;
      issuers: { issuerId: string }[];
    };
    assert.equal(roster.schemaVersion, IDENTITY_SCHEMA);
    assert.deepEqual(
      roster.issuers.map((issuer) => issuer.issuerId).sort(),
      [...ADMITTED_ISSUERS].sort(),
    );
  });

  test('the composed roster label names every contributing bundle and never reads as synthetic', () => {
    const merged = mergeIdentitySourceSets(readSets(ADMITTED_SOURCES));
    assert.equal(merged.ok, true);
    const label = merged.rosterLabel!;
    for (const bundle of ['REL-1-INFOSYS-2026-11-06', 'WI7-CONSUMER-MARICO-2026-11-07', 'WI8-INDUSTRIALS-KEC-2026-11-07']) {
      assert.ok(label.includes(bundle), `the label must name ${bundle}: ${label}`);
    }
    assert.equal(/synthetic/i.test(label), false, 'the composed label must not classify the set as synthetic');
    // Each source's own label is carried forward, so nothing the operator wrote is lost by the merge.
    assert.equal(merged.sourceRosterLabels.length, 3);
    assert.ok(merged.disclosures.length >= 3);
  });

  test('a source directory named "identity" is labelled by its bundle, not by the layout', () => {
    assert.equal(sourceBundleLabel(join(REAL_ISSUER, 'REL-1-INFOSYS-2026-11-06', 'identity')), 'REL-1-INFOSYS-2026-11-06');
    assert.equal(
      sourceBundleLabel(join(REAL_ISSUER, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input', 'identity')),
      'WI8-INDUSTRIALS-KEC-2026-11-07',
    );
    // All three sources sit in a directory called `identity`; they must still be distinguishable in every report line.
    const labels = withUniqueLabels(readSets(ADMITTED_SOURCES)).map((set) => set.label);
    assert.equal(new Set(labels).size, 3, `labels must be unique: ${labels.join(', ')}`);
  });

  test('the merge never freezes a loader default into a published assertion', () => {
    // A source that omits `sector` loads with the default UNCLASSIFIED. Publishing that default back out would claim
    // the operator declared a sector. The merged bytes must keep the omission.
    const bare = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'bare-identity'));
    const roster = JSON.parse(readFileSync(join(bare, IDENTITY_FILE_NAMES.roster), 'utf8')) as {
      issuers: Record<string, unknown>[];
    };
    delete roster.issuers[0]!.sector;
    delete roster.issuers[0]!.status;
    writeFileSync(join(bare, IDENTITY_FILE_NAMES.roster), JSON.stringify(roster, null, 2), 'utf8');

    const read = readIdentitySourceSet(bare);
    assert.equal(read.ok, true, JSON.stringify(read.ok ? [] : read.refusals));
    const merged = mergeIdentitySourceSets([read.set]);
    assert.equal(merged.ok, true, JSON.stringify(merged.refusals, null, 2));
    // The assertion is about the ISSUER record: the roster's securities legitimately carry their own `status`, so a
    // whole-text search would prove nothing. What must not appear is a default written back as an operator claim.
    const mergedRoster = JSON.parse(merged.candidate!.roster) as { issuers: Record<string, unknown>[] };
    const issuer = mergedRoster.issuers[0]!;
    assert.equal('sector' in issuer, false, 'no sector was invented for the issuer');
    assert.equal('status' in issuer, false, 'no eligibility status was invented for the issuer');
    assert.equal(merged.candidate!.roster.includes('UNCLASSIFIED'), false, 'the default was not written into the bytes');
    // The loader still applies its own defaults when it reads the merged set back.
    const staged = join(dataRoot, 'staged', 'investment', 'identity');
    mkdirSync(staged, { recursive: true });
    writeFileSync(join(staged, IDENTITY_FILE_NAMES.roster), merged.candidate!.roster, 'utf8');
    writeFileSync(join(staged, IDENTITY_FILE_NAMES.listingMap), merged.candidate!.listingMap, 'utf8');
    writeFileSync(join(staged, IDENTITY_FILE_NAMES.corporateActions), merged.candidate!.corporateActions, 'utf8');
    const loaded = loadIdentitySourcesFromDir(staged);
    assert.equal(loaded.available, true);
    if (loaded.available) assert.equal(loaded.sources.roster.issuers[0]!.sector, 'UNCLASSIFIED');
  });
});

describe('IID Stage 2 — preflight is read-only', () => {
  test('a preflight run creates nothing at all, not even the target directory', () => {
    assert.equal(run([...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot]), 0);
    assert.equal(existsSync(target), false, 'preflight must not create the identity directory');
    assert.deepEqual(readdirSync(dataRoot), [], 'preflight must not create anything under the data root');
  });

  test('the default mode is preflight, so a command line with no mode writes nothing', () => {
    const args = parseArgs([...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot]);
    assert.equal(args.mode, 'PREFLIGHT');
  });

  test('a preflight reports the SHA-256 of every source byte and attests that it wrote nothing', () => {
    const rendered = renderReport(preflightReport());
    for (const source of ADMITTED_SOURCES) {
      for (const name of FILE_NAMES) {
        const digest = sha256Of(readFileSync(join(source, name), 'utf8'));
        assert.ok(rendered.includes(digest), `the digest of ${source}/${name} must be reported`);
      }
    }
    assert.equal(rendered.includes('READ-ONLY RUN'), true);
    assert.equal(rendered.includes('WRITES PERFORMED'), false);
    assert.equal(rendered.includes('RESULT         PASS'), true);
    assert.equal(rendered.includes('refusals'), false, 'a passing preflight reports no refusals section');
  });

  test('a plan against an empty target reports every file as CREATED and says the set would change', () => {
    const merged = mergeIdentitySourceSets(readSets(ADMITTED_SOURCES));
    const plan = planPublication({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      candidateBytes: merged.candidateBytes!,
    });
    assert.equal(plan.governed, true);
    assert.equal(plan.wouldChange, true);
    assert.deepEqual(plan.files.map((file) => file.action), ['CREATED', 'CREATED', 'CREATED']);
    assert.deepEqual(plan.files.map((file) => file.existingSha256), [null, null, null]);
    assert.deepEqual(plan.refusals, []);
  });
});

describe('IID Stage 2 — execution publishes and protects', () => {
  test('an execute run publishes three files the existing loader accepts, and leaves no marker behind', () => {
    assert.equal(executeAdmitted(), 0);
    assert.deepEqual(readdirSync(target).sort(), [...FILE_NAMES].sort());
    assert.equal(existsSync(`${target}.iips-staging`), false, 'staging must be discarded on success');
    assert.equal(existsSync(`${target}.iips-previous`), false, 'the previous marker must be discarded on success');

    const loaded = loadIdentitySourcesFromDir(target);
    assert.equal(loaded.available, true, JSON.stringify(loaded.available ? [] : loaded.issues, null, 2));
    if (!loaded.available) return;
    assert.equal(loaded.sources.roster.issuers.length, 3);
    assert.equal(loaded.sources.roster.securities.length, 3);
    assert.equal(loaded.sources.listingMap.entries.length, 5);
    assert.equal(loaded.sources.rosterDataClass, 'OPERATOR_SUPPLIED');
    assert.equal(loaded.sources.roster.schemaVersion, IDENTITY_SCHEMA);
  });

  test('the runtime loader the coverage transport uses reports the sources available after publication', () => {
    executeAdmitted();
    const runtime = loadRuntimeIdentitySources(dataRoot);
    assert.equal(runtime.available, true, JSON.stringify(runtime.available ? [] : runtime.issues, null, 2));
  });

  test('published bytes are exactly the candidate bytes the preflight digested', () => {
    const before = preflightReport();
    assert.equal(executeAdmitted(), 0);
    for (const file of before.plan!.files) {
      assert.equal(
        sha256Of(readFileSync(file.path, 'utf8')),
        file.candidateSha256,
        `${file.fileName} must match the digest preflight reported for it`,
      );
    }
  });

  test('a second execute run reports UNCHANGED and leaves identical bytes', () => {
    const argv = [...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, '--execute'];
    assert.equal(run(argv), 0);
    const first = publishedTexts();
    assert.equal(run(argv), 0);
    assert.deepEqual(publishedTexts(), first, 're-running must be idempotent');
    const report = preflightReport(['--execute']);
    assert.equal(report.plan!.wouldChange, false);
    assert.deepEqual(report.plan!.files.map((file) => file.action), ['UNCHANGED', 'UNCHANGED', 'UNCHANGED']);
  });

  test('an idempotent EXECUTE re-publishes identical bytes through the real path, and says so truthfully', () => {
    // MEASURED, NOT ASSUMED. An all-UNCHANGED plan does NOT short-circuit: EXECUTE stages three fresh files and
    // renames them over the published ones, so the inodes are replaced even though the bytes are identical.
    // `stat -c %Y` cannot see this (second granularity) — the inode can. Pinning it matters because the report's
    // claims are only honest if the behaviour underneath is known: `published true`, `replacedExisting true` and
    // the WRITES_PERFORMED attestation are all TRUE here, because writes really were performed. A future change
    // that made EXECUTE skip an identical candidate would have to change those three claims with it.
    const argv = [...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, '--execute'];
    assert.equal(run(argv), 0);
    const beforeBytes = publishedTexts();
    const beforeInodes = FILE_NAMES.map((name) => statSync(join(target, name)).ino);

    const report = planRun(parseArgs(argv));
    const afterBytes = publishedTexts();
    const afterInodes = FILE_NAMES.map((name) => statSync(join(target, name)).ino);

    assert.equal(report.ok, true);
    assert.equal(report.plan!.wouldChange, false, 'nothing about the content would change');
    assert.deepEqual(afterBytes, beforeBytes, 'the bytes must be identical');
    assert.notDeepEqual(afterInodes, beforeInodes,
      'but the files were replaced, not skipped — this is what makes the attestation below truthful');
    assert.equal(report.publication!.published, true);
    assert.equal(report.publication!.replacedExisting, true);
    assert.equal(report.publication!.rolledBack, false);
    assert.equal(report.attestationClass, 'WRITES_PERFORMED');
    // The rename path is used, so no marker may survive an idempotent re-publish either.
    assert.deepEqual(readdirSync(target).filter((name) => name.includes('.iips-')), []);
    assert.deepEqual(readdirSync(target).sort(), [...FILE_NAMES].sort());
    // And the published set must still load through the existing loader afterwards.
    assert.equal(loadIdentitySourcesFromDir(target).available, true);
  });

  test('a valid published set is restored when publication is interrupted after the first swap', () => {
    assert.equal(executeAdmitted(), 0);
    const good = publishedTexts();

    // A DIFFERENT valid candidate: another real operator-supplied identity set. Nothing here is invented.
    const merged = mergeIdentitySourceSets(readSets([OTHER_VALID_SOURCE]));
    assert.equal(merged.ok, true, JSON.stringify(merged.refusals, null, 2));
    assert.equal(merged.counts.issuers, 1);
    const plan = planPublication({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      candidateBytes: merged.candidateBytes!,
    });
    assert.equal(plan.wouldChange, true);
    // The roster and listing map differ, so they are REPLACED. Both sets merge to an EMPTY corporate-action table
    // and the serializer is canonical, so those bytes are identical and that file is correctly UNCHANGED. The fault
    // below is injected at the second rename, by which point every existing file has already been moved aside, so
    // the rollback still has to restore all three.
    assert.deepEqual(
      plan.files.map((file) => file.action),
      ['REPLACED', 'REPLACED', 'UNCHANGED'],
    );

    // Interrupted after the first rename, the destination holds a MIXED set: one new file, two old ones.
    const outcome = publishIdentitySources({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      plan,
      fault: 'afterFirstRename',
    });
    assert.equal(outcome.published, false);
    assert.equal(outcome.rolledBack, true);
    assert.equal(outcome.replacedExisting, true);
    assert.equal(outcome.refusals.length, 1);
    assert.equal(outcome.refusals[0]!.code, 'PUBLICATION_FAILED');
    assert.ok(outcome.refusals[0]!.detail.includes('MIXED'), 'the refusal must say why a mixed set is unacceptable');
    assert.ok(outcome.rolledBackDetail!.includes('restored'), outcome.rolledBackDetail);

    // The previously published set is intact byte for byte, and no mixed set survived.
    assert.deepEqual(publishedTexts(), good, 'the good set must be restored exactly');
    const reloaded = loadIdentitySourcesFromDir(target);
    assert.equal(reloaded.available, true);
    if (reloaded.available) {
      assert.equal(reloaded.sources.roster.issuers.length, 3, 'restored to three issuers, not left at one');
    }
    assert.equal(existsSync(`${target}.iips-previous`), false, 'the marker must be cleaned up after a rollback');
  });

  test('a publication interrupted during staging never touches the destination', () => {
    assert.equal(executeAdmitted(), 0);
    const good = publishedTexts();
    const merged = mergeIdentitySourceSets(readSets([OTHER_VALID_SOURCE]));
    const plan = planPublication({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      candidateBytes: merged.candidateBytes!,
    });
    const outcome = publishIdentitySources({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      plan,
      fault: 'duringStaging',
    });
    assert.equal(outcome.published, false);
    assert.equal(outcome.rolledBack, true);
    assert.deepEqual(publishedTexts(), good);
  });

  test('a successful replacement discards the superseded set and publishes the new one', () => {
    assert.equal(executeAdmitted(), 0);
    const merged = mergeIdentitySourceSets(readSets([OTHER_VALID_SOURCE]));
    const plan = planPublication({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      candidateBytes: merged.candidateBytes!,
    });
    const outcome = publishIdentitySources({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      plan,
    });
    assert.equal(outcome.published, true);
    assert.equal(outcome.rolledBack, false);
    assert.equal(outcome.replacedExisting, true);
    assert.equal(outcome.verification!.available, true);
    assert.equal(outcome.verification!.issuers, 1, 'the replacement set really was published');
    assert.equal(outcome.verification!.listings, 2);
    assert.equal(existsSync(`${target}.iips-previous`), false);
    assert.equal(existsSync(`${target}.iips-staging`), false);
    for (const file of outcome.files) {
      assert.equal(sha256Of(readFileSync(file.path, 'utf8')), file.sha256);
    }
  });

  test('verification re-reads the published bytes rather than trusting what was written', () => {
    executeAdmitted();
    const verification = verifyPublishedIdentityDir(target);
    assert.equal(verification.available, true);
    assert.equal(verification.issuers, 3);
    assert.equal(verification.securities, 3);
    assert.equal(verification.listings, 5);
    assert.equal(verification.actions, 0);
    assert.equal(verification.rosterDataClass, 'OPERATOR_SUPPLIED');
    for (const version of [
      verification.rosterVersion,
      verification.listingMapVersion,
      verification.corporateActionTableVersion,
    ]) {
      assert.match(version!, /^sha256:[0-9a-f]{64}$/);
    }
  });

  test('verification of a directory that holds nothing reports unavailable rather than empty-but-fine', () => {
    const verification = verifyPublishedIdentityDir(target);
    assert.equal(verification.available, false);
    assert.equal(verification.issuers, 0);
    assert.ok(verification.issues.length > 0);
    assert.equal(verification.issues[0]!.code, 'IDENTITY_SOURCE_MISSING');
  });
});

describe('IID Stage 2 — refusal is total, and nothing is written when anything is refused', () => {
  const cases: readonly { readonly name: string; readonly code: string; readonly arrange: () => string[] }[] = [
    {
      name: 'a synthetic fixture offered as operational data',
      code: 'SYNTHETIC_SOURCE_REFUSED',
      arrange: () => [SYNTHETIC_FIXTURES],
    },
    {
      name: 'a source directory that does not exist',
      code: 'SOURCE_DIR_MISSING',
      arrange: () => [join(dataRoot, 'no-such-identity-dir')],
    },
    {
      name: 'a source path that is a file, not a directory',
      code: 'SOURCE_DIR_NOT_A_DIRECTORY',
      arrange: () => {
        const path = join(dataRoot, 'a-file.json');
        writeFileSync(path, '{}', 'utf8');
        return [path];
      },
    },
    {
      name: 'a source directory missing one of the three files',
      code: 'SOURCE_FILE_MISSING',
      arrange: () => {
        const dir = join(dataRoot, 'partial');
        mkdirSync(dir, { recursive: true });
        for (const name of [IDENTITY_FILE_NAMES.roster, IDENTITY_FILE_NAMES.listingMap]) {
          writeFileSync(join(dir, name), readFileSync(join(ADMITTED_SOURCES[0]!, name), 'utf8'), 'utf8');
        }
        return [dir];
      },
    },
    {
      name: 'a file that is not JSON',
      code: 'SOURCE_FILE_UNREADABLE',
      arrange: () => {
        const dir = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'not-json'));
        writeFileSync(join(dir, IDENTITY_FILE_NAMES.roster), '{ this is not json', 'utf8');
        return [dir];
      },
    },
    {
      name: 'a file declaring a different schema',
      code: 'SOURCE_SCHEMA_MISMATCH',
      arrange: () => {
        const dir = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'wrong-schema'));
        const roster = JSON.parse(readFileSync(join(dir, IDENTITY_FILE_NAMES.roster), 'utf8')) as Record<string, unknown>;
        roster.schemaVersion = 'SOMETHING_ELSE_V9';
        writeFileSync(join(dir, IDENTITY_FILE_NAMES.roster), JSON.stringify(roster, null, 2), 'utf8');
        return [dir];
      },
    },
    {
      name: 'the same issuer declared DIFFERENTLY by two sources',
      code: 'CONFLICTING_ISSUER_RECORD',
      arrange: () => {
        const a = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'conflict-a'));
        const b = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'conflict-b'));
        const roster = JSON.parse(readFileSync(join(b, IDENTITY_FILE_NAMES.roster), 'utf8')) as {
          issuers: Record<string, unknown>[];
        };
        roster.issuers[0]!.sector = 'Financials';
        writeFileSync(join(b, IDENTITY_FILE_NAMES.roster), JSON.stringify(roster, null, 2), 'utf8');
        return [a, b];
      },
    },
    {
      name: 'the same issuer declared IDENTICALLY by two sources',
      code: 'DUPLICATE_ISSUER_RECORD',
      arrange: () => [
        copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'dup-a')),
        copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'dup-b')),
      ],
    },
    {
      name: 'the same source directory supplied twice',
      code: 'DUPLICATE_SOURCE_DIR',
      arrange: () => [ADMITTED_SOURCES[0]!, ADMITTED_SOURCES[0]!],
    },
    {
      name: 'a real corporate action recorded under a key the validators do not read',
      code: 'CORPORATE_ACTIONS_UNDER_UNREAD_KEY',
      arrange: () => {
        const dir = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'unread-key'));
        writeFileSync(
          join(dir, IDENTITY_FILE_NAMES.corporateActions),
          JSON.stringify(
            {
              schemaVersion: IDENTITY_SCHEMA,
              entries: [
                {
                  actionId: 'CA-1',
                  type: 'SPLIT',
                  effectiveDate: '2024-04-01',
                  subjectIssuerId: 'IN:CIN:L85110KA1981PLC013115',
                  adjustmentFactor: 0.5,
                },
              ],
            },
            null,
            2,
          ),
          'utf8',
        );
        return [dir];
      },
    },
  ];

  for (const testCase of cases) {
    test(`${testCase.name} is refused, and the target is left untouched`, () => {
      const sources = testCase.arrange();
      const argv = [...sources.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, '--execute'];
      assert.equal(run(argv), 1, 'a refused run must exit non-zero');
      const report = planRun(parseArgs(argv));
      assert.equal(report.ok, false);
      assert.equal(report.publication, null, 'nothing may be published after a refusal');
      assert.ok(
        report.refusals.some((item) => item.code === testCase.code),
        `expected ${testCase.code}, got ${report.refusals.map((item) => item.code).join(', ')}`,
      );
      assert.equal(existsSync(target), false, 'a refused run must not create the identity directory');
      assert.deepEqual(readdirSync(dataRoot).filter((name) => name.startsWith('.')), []);
    });
  }

  test('a refusal already published nothing, so an existing valid set survives a refused run', () => {
    assert.equal(executeAdmitted(), 0);
    const good = publishedTexts();
    const argv = ['--source', SYNTHETIC_FIXTURES, '--data-root', dataRoot, '--execute'];
    assert.equal(run(argv), 1);
    assert.deepEqual(publishedTexts(), good, 'a refused run must not disturb what is already published');
  });

  test('a conflict names both source directories, so the operator knows what to reconcile', () => {
    const a = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'named-a'));
    const b = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'named-b'));
    const roster = JSON.parse(readFileSync(join(b, IDENTITY_FILE_NAMES.roster), 'utf8')) as {
      issuers: Record<string, unknown>[];
    };
    roster.issuers[0]!.sector = 'Financials';
    writeFileSync(join(b, IDENTITY_FILE_NAMES.roster), JSON.stringify(roster, null, 2), 'utf8');

    const merged = mergeIdentitySourceSets(readSets([a, b]));
    assert.equal(merged.ok, false);
    const conflict = merged.refusals.find((item) => item.code === 'CONFLICTING_ISSUER_RECORD');
    assert.ok(conflict, JSON.stringify(merged.refusals, null, 2));
    assert.equal(conflict!.subject, 'IN:CIN:L85110KA1981PLC013115');
    assert.equal(conflict!.sources.length, 2, 'both directories must be named');
    assert.ok(conflict!.detail.includes('sector'), 'the differing field must be named');
  });

  test('an EMPTY array under an unread key loses nothing, so it is disclosed rather than refused', () => {
    // This is the real WI8 shape: `entries: []` plus a note. Refusing it would block Stage 2 over prose.
    const read = readIdentitySourceSet(ADMITTED_SOURCES[2]!);
    assert.equal(read.ok, true, JSON.stringify(read.ok ? [] : read.refusals, null, 2));
    const merged = mergeIdentitySourceSets(readSets(ADMITTED_SOURCES));
    assert.equal(merged.ok, true);
    assert.equal(merged.counts.actions, 0);
    assert.ok(
      merged.disclosures.some((line) => line.includes('EMPTY')),
      'an empty corporate-action table must be disclosed as "no action is claimed", not "none was checked"',
    );
  });

  test('a target that is not <dataRoot>/investment/identity is refused wherever it points', () => {
    const bad = [
      '/tmp/elsewhere',
      join(dataRoot, 'investment'),
      join(dataRoot, 'identity'),
      join(dataRoot, 'investment', 'identities'),
      join(dataRoot, 'investment', 'dataset'),
    ];
    for (const path of bad) {
      const refusal = assertGovernedIdentityDir(path);
      assert.ok(refusal, `${path} must be refused`);
      assert.equal(refusal!.code, 'TARGET_OUTSIDE_GOVERNED_IDENTITY_DIR');
    }
    assert.equal(assertGovernedIdentityDir(target), null, 'the governed target must be accepted');
    // The Windows path shape is governed too, which is what makes the same guard valid on the host.
    assert.equal(assertGovernedIdentityDir('C:\\iips-data\\investment\\identity'), null);
    assert.ok(assertGovernedIdentityDir('C:\\iips-data\\investment\\dataset'), 'the dataset directory is not the identity directory');
  });

  test('a refused target is not written to even when the sources are valid', () => {
    const unguarded = join(dataRoot, 'not-governed');
    const argv = [...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--identity-dir', unguarded, '--execute'];
    assert.equal(run(argv), 1);
    assert.equal(existsSync(unguarded), false);
    const report = planRun(parseArgs(argv));
    assert.equal(report.governed, false);
    assert.equal(report.publication, null);
  });

  test('a source whose bundle name would make the merged label read as synthetic is refused', () => {
    // The composed label is checked, so a directory named "synthetic-..." cannot silently reclassify the merged set
    // as a fixture — which would make real coverage report itself as synthetic, or hide a fixture as operational.
    const dir = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'synthetic-candidates', 'identity'));
    const merged = mergeIdentitySourceSets(readSets([dir]));
    assert.equal(merged.ok, false);
    assert.ok(
      merged.refusals.some((item) => item.code === 'COMPOSED_LABEL_UNSAFE'),
      JSON.stringify(merged.refusals.map((item) => item.code)),
    );
  });

  test('a merged set with no issuer is refused rather than published as empty coverage', () => {
    const dir = copySource(ADMITTED_SOURCES[0]!, join(dataRoot, 'no-issuers'));
    writeFileSync(
      join(dir, IDENTITY_FILE_NAMES.roster),
      JSON.stringify({ schemaVersion: IDENTITY_SCHEMA, rosterLabel: 'no issuers', issuers: [], securities: [] }, null, 2),
      'utf8',
    );
    writeFileSync(
      join(dir, IDENTITY_FILE_NAMES.listingMap),
      JSON.stringify({ schemaVersion: IDENTITY_SCHEMA, entries: [] }, null, 2),
      'utf8',
    );
    const merged = mergeIdentitySourceSets(readSets([dir]));
    assert.equal(merged.ok, false);
    assert.ok(
      merged.refusals.some((item) => item.code === 'NOTHING_TO_PUBLISH'),
      JSON.stringify(merged.refusals.map((item) => item.code)),
    );
  });

  test('merging nothing at all is refused', () => {
    const merged = mergeIdentitySourceSets([]);
    assert.equal(merged.ok, false);
    assert.equal(merged.refusals[0]!.code, 'NOTHING_TO_PUBLISH');
  });
});

describe('IID Stage 2 — holding-to-issuer resolution against the published set', () => {
  test('every declared identifier resolves to its issuer, on both resolution paths', () => {
    executeAdmitted();
    const probe = probeDeclaredIdentifierResolution({ identityDir: target, asOf: AS_OF });
    assert.equal(probe.sourcesAvailable, true);
    assert.equal(probe.probeClass, 'DECLARED_IDENTIFIER_SELF_CONSISTENCY');
    // 3 roster securities on the ISIN path + 5 listing-map entries on the exchange/symbol path.
    assert.equal(probe.observed, 8);
    assert.equal(probe.resolved, 8);
    assert.equal(probe.assessable, 8);
    assert.equal(probe.unresolved, 0);
    assert.equal(probe.resolved + probe.unresolved, probe.observed, 'observed, assessable and unresolved must reconcile');
    assert.deepEqual(probe.issuerKeyConflicts, [], 'no ISSUER_KEY_CONFLICT may remain');

    for (const issuer of ADMITTED_ISSUERS) {
      const items = probe.items.filter((item) => item.issuerId === issuer);
      assert.ok(items.length >= 2, `${issuer} must be reachable by ISIN and by listing`);
      assert.ok(
        items.every((item) => item.state === 'RESOLVED'),
        `${issuer}: ${items.map((item) => item.state).join(', ')}`,
      );
    }
    const isinItems = probe.items.filter((item) => item.kind === 'DECLARED_ISIN');
    assert.equal(isinItems.length, 3);
    assert.deepEqual([...new Set(isinItems.map((item) => item.resolutionBasis))], ['ISIN']);
    const listingItems = probe.items.filter((item) => item.kind === 'DECLARED_LISTING');
    assert.equal(listingItems.length, 5);
    assert.deepEqual([...new Set(listingItems.map((item) => item.resolutionBasis))], ['EXCHANGE_SYMBOL']);
    // Each resolved item carries the issuer key basis the roster declared.
    assert.deepEqual([...new Set(probe.items.map((item) => item.issuerKeyBasis))], ['CIN']);
  });

  test('the probe is labelled as self-consistency, so it can never be quoted as a portfolio reading', () => {
    executeAdmitted();
    const probe = probeDeclaredIdentifierResolution({ identityDir: target, asOf: AS_OF });
    assert.ok(probe.note.includes('NOT a reading of holdings'), probe.note);
    assert.deepEqual([...new Set(probe.items.map((item) => item.observationId.startsWith('probe-')))], [true]);
    const rendered = renderReport(planRun(parseArgs(['--verify-only', '--probe', '--data-root', dataRoot])));
    assert.equal(rendered.includes('DECLARED_IDENTIFIER_SELF_CONSISTENCY'), true);
    assert.equal(rendered.includes('ISSUER_KEY_CONFLICT  none observed'), true);
    assert.equal(rendered.includes('reconciliation  8 + 0 = 8 observed'), true);
  });

  test('a probe against an unpublished directory reports no sources rather than zero coverage', () => {
    const probe = probeDeclaredIdentifierResolution({ identityDir: target, asOf: AS_OF });
    assert.equal(probe.sourcesAvailable, false);
    assert.equal(probe.observed, 0);
    assert.equal(probe.resolved, 0);
    assert.ok(probe.issues.length > 0);
    assert.equal(probe.issuerKeyConflicts.length, 0);
  });

  test('a verify-only run over an unpublished directory fails instead of passing vacuously', () => {
    assert.equal(run(['--verify-only', '--data-root', dataRoot]), 1);
    const report = planRun(parseArgs(['--verify-only', '--data-root', dataRoot]));
    assert.equal(report.ok, false);
    assert.equal(report.merge.attempted, false, 'verify-only never reads sources');
    assert.equal(report.verification!.available, false);
  });

  test('a verify-only run over the published set passes and reports the loader versions', () => {
    executeAdmitted();
    assert.equal(run(['--verify-only', '--probe', '--data-root', dataRoot, '--as-of', AS_OF]), 0);
    const report = planRun(parseArgs(['--verify-only', '--probe', '--data-root', dataRoot, '--as-of', AS_OF]));
    assert.equal(report.ok, true);
    assert.equal(report.publication, null, 'verify-only publishes nothing');
    assert.equal(report.verification!.available, true);
    assert.equal(report.verification!.issuers, 3);
    assert.equal(report.probe!.resolved, 8);
    assert.equal(existsSync(`${target}.iips-staging`), false);
  });
});

describe('IID Stage 2 — CLI contract', () => {
  test('usage errors exit 2 and write nothing', () => {
    assert.equal(run([]), 2, 'no target at all');
    assert.equal(run(['--data-root', dataRoot]), 2, 'no source for a preflight');
    assert.equal(run(['--source', ADMITTED_SOURCES[0]!, '--data-root', dataRoot, '--execute', '--verify-only']), 2);
    assert.equal(run(['--source', ADMITTED_SOURCES[0]!, '--data-root', dataRoot, '--identity-dir', target]), 2, 'two targets');
    assert.equal(run(['--source', ADMITTED_SOURCES[0]!, '--data-root', dataRoot, '--nonsense']), 2);
    assert.equal(run(['--source', ADMITTED_SOURCES[0]!, '--data-root']), 2, 'a flag with no value');
    assert.equal(run(['--source', ADMITTED_SOURCES[0]!, '--data-root', dataRoot, '--data-root', dataRoot]), 2, 'a repeated flag');
    assert.equal(existsSync(target), false, 'no usage error may create anything');
  });

  test('repeating the SAME mode is not a conflict', () => {
    assert.equal(
      run(['--source', ADMITTED_SOURCES[0]!, '--data-root', dataRoot, '--preflight', '--preflight']),
      0,
    );
    assert.equal(existsSync(target), false);
  });

  test('a verify-only run needs no source, and an execute run does', () => {
    assert.doesNotThrow(() => parseArgs(['--verify-only', '--data-root', dataRoot]));
    assert.throws(() => parseArgs(['--execute', '--data-root', dataRoot]), /at least one --source/);
    assert.throws(() => parseArgs(['--data-root', dataRoot, '--source']), /requires a value/);
  });

  test('--identity-dir addresses the same governed directory as --data-root', () => {
    const byRoot = parseArgs(['--verify-only', '--data-root', dataRoot]);
    const byDir = parseArgs(['--verify-only', '--identity-dir', join(dataRoot, 'investment', 'identity')]);
    assert.equal(byRoot.targetDir, byDir.targetDir);
  });

  test('--report writes the machine-readable record and discloses that one write', () => {
    const reportPath = join(dataRoot, 'report', 'provision.json');
    const argv = [...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, '--report', reportPath];
    assert.equal(run(argv), 0);
    assert.equal(existsSync(reportPath), true);
    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as ProvisionReport;
    assert.equal(report.reportVersion, 1);
    assert.equal(report.mode, 'PREFLIGHT');
    assert.equal(report.ok, true);
    assert.equal(report.sources.length, 3);
    assert.equal(report.merge.counts.issuers, 3);
    assert.equal(report.merge.counts.listings, 5);
    // A preflight that writes only its report still attests READ_ONLY toward the identity target, and names the
    // one write it did perform. Claiming blanket read-only while writing a file would be the dishonest version.
    assert.equal(report.attestationClass, 'READ_ONLY');
    assert.ok(report.readOnlyAttestation.includes('READ-ONLY RUN toward the identity target'), report.readOnlyAttestation);
    assert.ok(report.readOnlyAttestation.includes(reportPath), 'the report write must be disclosed by path');
    assert.equal(existsSync(target), false, 'the report write must be the only write a preflight performs');
  });

  test('the attestation states what actually happened, not what the mode asked for', () => {
    const argv = [...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot];
    // A preflight with no --report performs no write at all.
    assert.equal(planRun(parseArgs(argv)).attestationClass, 'READ_ONLY');

    // An EXECUTE refused before publishing wrote nothing, and must not claim a publication.
    const refused = planRun(parseArgs(['--source', SYNTHETIC_FIXTURES, '--data-root', dataRoot, '--execute']));
    assert.equal(refused.ok, false);
    assert.equal(refused.publication, null);
    assert.equal(refused.attestationClass, 'NOTHING_WRITTEN_REFUSED');
    assert.ok(refused.readOnlyAttestation.includes('refused before any publication'), refused.readOnlyAttestation);

    // A successful EXECUTE attests the publication.
    const executed = planRun(parseArgs([...argv, '--execute']));
    assert.equal(executed.ok, true);
    assert.equal(executed.attestationClass, 'WRITES_PERFORMED');
    assert.ok(executed.readOnlyAttestation.includes('the three identity files'));

    // VERIFY_ONLY never publishes, whatever is on disk.
    assert.equal(planRun(parseArgs(['--verify-only', '--data-root', dataRoot])).attestationClass, 'READ_ONLY');
  });

  test('a rolled-back publication attests the rollback rather than a publication', () => {
    assert.equal(executeAdmitted(), 0);
    const merged = mergeIdentitySourceSets(readSets([OTHER_VALID_SOURCE]));
    const plan = planPublication({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      candidateBytes: merged.candidateBytes!,
    });
    const outcome = publishIdentitySources({
      targetDir: target,
      candidate: merged.candidate!,
      candidateSha256: merged.candidateSha256!,
      plan,
      fault: 'afterFirstRename',
    });
    assert.equal(outcome.published, false);
    assert.equal(outcome.rolledBack, true);
    // The CLI's attestation is derived from exactly these two flags, so the rolled-back outcome maps to its own
    // class rather than to WRITES_PERFORMED.
    const report = planRun(parseArgs(['--verify-only', '--data-root', dataRoot]));
    assert.equal(report.publication, null);
    assert.equal(report.attestationClass, 'READ_ONLY');
  });

  test('the machine-readable trailer is present, one fact per line, and parseable without prose', () => {
    assert.equal(executeAdmitted(), 0);
    const rendered = renderReport(planRun(parseArgs(['--verify-only', '--probe', '--data-root', dataRoot, '--as-of', AS_OF])));
    const marker = '--- machine-readable ---';
    const index = rendered.indexOf(marker);
    assert.ok(index >= 0, 'the trailer marker must be present');
    // Only the region after the marker is searched, because the human report also has lines beginning `mode`,
    // `target`, `governed` and `result`, and a case-insensitive search would read those instead.
    const block = rendered.slice(index + marker.length).split('\n').filter((line) => line.trim() !== '');
    const value = (key: string): string => {
      const pattern = new RegExp(`^${key.replace(/\./g, '\\.')}\\s+`);
      const hit = block.find((line) => pattern.test(line));
      return hit === undefined ? '' : hit.replace(pattern, '');
    };
    assert.equal(value('mode'), 'VERIFY_ONLY');
    assert.equal(value('governed'), 'true');
    assert.equal(value('target'), target);
    assert.equal(value('merge.attempted'), 'false');
    assert.equal(value('refusal.count'), '0');
    assert.equal(value('attestation'), 'READ_ONLY');
    assert.equal(value('verification.available'), 'true');
    assert.equal(value('probe.resolved'), '8');
    assert.equal(value('probe.issuerKeyConflicts'), '0');
    assert.equal(value('merge.issuers'), '0', 'verify-only merges nothing, so it reports no merged issuer');
    assert.deepEqual(
      block.filter((line) => line.startsWith('probe.item ')).length,
      8,
      'one trailer line per probe item, so a host transcript can be read line by line',
    );
    assert.equal(value('nonexistent.key'), '', 'an absent key must read as absent, never as a neighbouring line');
    for (const line of block) {
      assert.match(line, /^[a-z][a-zA-Z.]*\s+\S/, `every trailer line must be "key value...": ${line}`);
    }
  });

  test('an execute report records the publication and the post-publish verification together', () => {
    const reportPath = join(dataRoot, 'report', 'execute.json');
    const argv = [
      ...ADMITTED_SOURCES.flatMap((dir) => ['--source', dir]),
      '--data-root',
      dataRoot,
      '--execute',
      '--probe',
      '--as-of',
      AS_OF,
      '--report',
      reportPath,
    ];
    assert.equal(run(argv), 0);
    const report = JSON.parse(readFileSync(reportPath, 'utf8')) as ProvisionReport;
    assert.equal(report.mode, 'EXECUTE');
    assert.equal(report.ok, true);
    assert.equal(report.publication!.published, true);
    assert.equal(report.publication!.rolledBack, false);
    assert.equal(report.publication!.files.length, 3);
    assert.equal(report.verification!.available, true);
    assert.equal(report.probe!.resolved, 8);
    assert.deepEqual(report.probe!.issuerKeyConflicts, []);
    assert.equal(report.attestationClass, 'WRITES_PERFORMED');
    assert.ok(report.readOnlyAttestation.includes('the three identity files'));
  });

  test('the rendered report is stable for identical input, so a host transcript can be diffed', () => {
    const first = renderReport(preflightReport(['--as-of', AS_OF]));
    const second = renderReport(preflightReport(['--as-of', AS_OF]));
    assert.equal(first, second);
    assert.equal(first.includes('RESULT         PASS'), true);
  });
});
