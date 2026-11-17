#!/usr/bin/env tsx
/**
 * IID Stage 2 — identity provisioning CLI (operator-supplied sources in, governed identity files out).
 *
 *   tsx src/investment/cli/provision-identity.ts --source <identityDir> [--source <identityDir> ...] \
 *     (--data-root <dir> | --identity-dir <dir>) [--preflight | --execute | --verify-only] \
 *     [--as-of <YYYY-MM-DD>] [--probe] [--report <path.json>]
 *
 * THREE MODES. `--preflight` is the DEFAULT, so a command line with no mode writes nothing:
 *
 *   --preflight    read and validate every source set, merge them, validate the merged set through the existing
 *                  identity loader, compare it against what is already published, and report the SHA-256 digest of
 *                  every source file and every candidate file. WRITES NOTHING. Repeatable without churn: a
 *                  candidate identical to the published set is reported as UNCHANGED.
 *   --execute      everything preflight does, then publish: stage all three files whole, move the existing set
 *                  aside, rename each staged file into place, re-read the published bytes, and restore the previous
 *                  set if anything fails. Then verify and (with --probe) exercise resolution.
 *   --verify-only  ignore the sources entirely: re-read the published identity directory through the existing
 *                  loader, report its versions and record counts, and with --probe report resolution. This is the
 *                  post-execution verification command; it writes nothing.
 *
 * EXIT CODES. 0 the run succeeded (preflight publishable / execute published and verified / verify-only available).
 * 1 the run was refused or a publication failed and was rolled back. 2 the command line itself was wrong.
 *
 * WHAT IT REFUSES. A missing source directory or file, unreadable or non-JSON content, a schema other than
 * IIPS_INVESTMENT_IDENTITY_V1, any source the existing validators reject, a source roster that self-classifies as a
 * synthetic fixture, two sources claiming one issuer/security/listing/action (identically OR differently), records
 * with no identity key, corporate actions recorded under a key the validators do not read, a merged set that fails
 * validation, a merged set naming no issuer, and any target that is not <dataRoot>/investment/identity. Every
 * refusal names its subject and the source directories involved. NOTHING IS REPAIRED, DEFAULTED OR INVENTED.
 *
 * No network calls of any kind. Reads the given source directories and the target directory; writes only the
 * governed identity directory, its two sibling marker directories, and (only if --report is given) that one path.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  assertGovernedIdentityDir,
  governedIdentityDir,
  mergeIdentitySourceSets,
  planPublication,
  probeDeclaredIdentifierResolution,
  publishIdentitySources,
  readIdentitySourceSet,
  verifyPublishedIdentityDir,
  FILE_NAME_OF_KEY,
  PROVISION_FILE_KEYS,
  PROVISION_REPORT_VERSION,
  type IdentitySourceSet,
  type PublicationPlan,
  type ProvisionFileKey,
  type ProvisionRefusal,
  type ResolutionProbe,
} from '../identity/provision';
import { financialCoverageFromLocalDataset } from '../identity/runtime';
import type { IdentitySourceTexts } from '../identity/sources';
import { RESOLUTION_STATES } from '../identity/types';

export type ProvisionMode = 'PREFLIGHT' | 'EXECUTE' | 'VERIFY_ONLY';

export interface ProvisionArgs {
  readonly mode: ProvisionMode;
  readonly sources: readonly string[];
  readonly targetDir: string;
  readonly dataRoot: string | null;
  readonly asOf: string | null;
  readonly probe: boolean;
  readonly report: string | null;
}

export class ProvisionUsageError extends Error {}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Parse argv. The FIRST occurrence of each flag wins, and a repeated `--source` accumulates in order. */
export function parseArgs(argv: readonly string[]): ProvisionArgs {
  const sources: string[] = [];
  let dataRoot: string | null = null;
  let identityDir: string | null = null;
  let mode: ProvisionMode | null = null;
  let asOf: string | null = null;
  let probe = false;
  let report: string | null = null;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]!;
    const next = (): string => {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new ProvisionUsageError(`${token} requires a value`);
      }
      index += 1;
      return value;
    };
    switch (token) {
      case '--source':
        sources.push(next());
        break;
      case '--data-root':
        if (dataRoot !== null) throw new ProvisionUsageError('--data-root was supplied more than once');
        dataRoot = next();
        break;
      case '--identity-dir':
        if (identityDir !== null) throw new ProvisionUsageError('--identity-dir was supplied more than once');
        identityDir = next();
        break;
      case '--preflight':
      case '--execute':
      case '--verify-only': {
        const selected: ProvisionMode =
          token === '--execute' ? 'EXECUTE' : token === '--verify-only' ? 'VERIFY_ONLY' : 'PREFLIGHT';
        if (mode !== null && mode !== selected) {
          throw new ProvisionUsageError(
            `${token} conflicts with the mode already selected (${mode}); choose exactly one`,
          );
        }
        mode = selected;
        break;
      }
      case '--as-of':
        if (asOf !== null) throw new ProvisionUsageError('--as-of was supplied more than once');
        asOf = next();
        break;
      case '--probe':
        probe = true;
        break;
      case '--report':
        if (report !== null) throw new ProvisionUsageError('--report was supplied more than once');
        report = next();
        break;
      default:
        throw new ProvisionUsageError(`unknown argument "${token}"`);
    }
  }

  if (dataRoot !== null && identityDir !== null) {
    throw new ProvisionUsageError('--data-root and --identity-dir are alternatives; supply exactly one');
  }
  if (dataRoot === null && identityDir === null) {
    throw new ProvisionUsageError('supply --data-root <dir> or --identity-dir <dir>');
  }

  const resolvedMode = mode ?? 'PREFLIGHT';
  const targetDir = identityDir !== null ? resolve(identityDir) : governedIdentityDir(dataRoot ?? undefined);

  if (resolvedMode !== 'VERIFY_ONLY' && sources.length === 0) {
    throw new ProvisionUsageError(`${resolvedMode} requires at least one --source <identityDir>`);
  }

  return {
    mode: resolvedMode,
    sources,
    targetDir,
    dataRoot,
    asOf: asOf ?? today(),
    probe,
    report,
  };
}

export interface ProvisionReportSource {
  readonly dir: string;
  readonly label: string;
  readonly rosterLabel: string;
  readonly dataClass: IdentitySourceSet['dataClass'];
  readonly files: readonly {
    readonly fileName: string;
    readonly path: string;
    readonly bytes: number;
    readonly sha256: string;
  }[];
}

export interface ProvisionReport {
  readonly reportVersion: typeof PROVISION_REPORT_VERSION;
  readonly mode: ProvisionMode;
  readonly asOf: string;
  readonly targetDir: string;
  readonly governed: boolean;
  readonly sources: readonly ProvisionReportSource[];
  readonly merge: {
    /** False in VERIFY_ONLY, which never reads sources: a non-attempted merge is not a refused one. */
    readonly attempted: boolean;
    readonly ok: boolean;
    readonly counts: { sources: number; issuers: number; securities: number; listings: number; actions: number };
    readonly rosterLabel: string | null;
    readonly candidateSha256: Readonly<Record<ProvisionFileKey, string>> | null;
    readonly candidateBytes: Readonly<Record<ProvisionFileKey, number>> | null;
    readonly sourceRosterLabels: readonly string[];
    readonly disclosures: readonly string[];
  };
  readonly plan: {
    readonly wouldChange: boolean;
    readonly files: readonly {
      readonly fileName: string;
      readonly path: string;
      readonly action: string;
      readonly candidateSha256: string;
      readonly candidateBytes: number;
      readonly existingSha256: string | null;
      readonly existingBytes: number | null;
    }[];
  } | null;
  readonly publication: {
    readonly published: boolean;
    readonly replacedExisting: boolean;
    readonly rolledBack: boolean;
    readonly rolledBackDetail: string | null;
    readonly files: readonly { fileName: string; path: string; action: string; sha256: string; bytes: number }[];
  } | null;
  readonly verification: ReturnType<typeof verifyPublishedIdentityDir> | null;
  readonly probe: ResolutionProbe | null;
  readonly refusals: readonly ProvisionRefusal[];
  readonly readOnlyAttestation: string;
  readonly attestationClass: AttestationClass;
  readonly ok: boolean;
}

/**
 * What this run actually did to the filesystem, stated from the publication outcome rather than from the mode.
 *
 * Deriving it from the mode alone would be a lie in two directions: an EXECUTE that was REFUSED before publishing
 * wrote nothing, and an EXECUTE that failed mid-swap wrote, then undid what it wrote. Both have to say so, because
 * the host script cross-checks this attestation against the mode it asked for.
 */
export type AttestationClass =
  | 'READ_ONLY'
  | 'WRITES_PERFORMED'
  | 'WRITES_ROLLED_BACK'
  | 'NOTHING_WRITTEN_REFUSED';

function attestationFor(input: {
  readonly mode: ProvisionMode;
  readonly published: boolean;
  readonly rolledBack: boolean;
  readonly wroteReport: boolean;
  readonly reportPath: string | null;
}): { readonly klass: AttestationClass; readonly text: string } {
  const reportWrite = input.wroteReport && input.reportPath !== null ? `the report file ${input.reportPath}` : null;

  if (input.mode !== 'EXECUTE') {
    const writes = reportWrite === null ? [] : [reportWrite];
    if (writes.length === 0) {
      return {
        klass: 'READ_ONLY',
        text: 'READ-ONLY RUN: no file was created, modified, moved or deleted anywhere, including the target identity directory.',
      };
    }
    return {
      klass: 'READ_ONLY',
      text: `READ-ONLY RUN toward the identity target: nothing under it was created, modified, moved or deleted. The one write performed was ${writes.join('; ')}.`,
    };
  }

  if (input.rolledBack) {
    return {
      klass: 'WRITES_ROLLED_BACK',
      text:
        'ROLLED BACK: files were staged and moved during the attempted publication and then restored, so the target '
        + 'holds exactly what it held before this run and no partial or mixed set was left published.'
        + (reportWrite === null ? '' : ` The one other write performed was ${reportWrite}.`),
    };
  }

  if (!input.published) {
    return {
      klass: 'NOTHING_WRITTEN_REFUSED',
      text:
        'NOTHING WAS WRITTEN: this run was in EXECUTE mode but was refused before any publication, so no identity '
        + 'file was created, modified, moved or deleted.'
        + (reportWrite === null ? '' : ` The one write performed was ${reportWrite}.`),
    };
  }

  const writes = [
    'the three identity files in the governed target directory (staged whole, then renamed into place)',
    'the sibling staging and previous marker directories, which are removed on success',
  ];
  if (reportWrite !== null) writes.push(reportWrite);
  return {
    klass: 'WRITES_PERFORMED',
    text: `WRITES PERFORMED: ${writes.join('; ')}. Nothing else was created, modified, moved or deleted.`,
  };
}

/** The whole run, as a value, so a test can assert on it without parsing stdout. */
export function plan(args: ProvisionArgs): ProvisionReport {
  const refusals: ProvisionRefusal[] = [];
  const notGoverned = assertGovernedIdentityDir(args.targetDir);
  if (notGoverned !== null) refusals.push(notGoverned);

  const reportSources: ProvisionReportSource[] = [];
  let mergeResult: ReturnType<typeof mergeIdentitySourceSets> | null = null;
  let planned: PublicationPlan | null = null;
  let publication: ProvisionReport['publication'] = null;
  let verification: ProvisionReport['verification'] = null;
  let probe: ResolutionProbe | null = null;

  if (args.mode === 'VERIFY_ONLY') {
    verification = verifyPublishedIdentityDir(args.targetDir);
    if (!verification.available) {
      refusals.push({
        code: 'POST_PUBLISH_VERIFICATION_FAILED',
        subject: args.targetDir,
        detail: `the published identity set does not load: ${verification.issues
          .map((issue) => `${issue.file} ${issue.code} [${issue.subject}] ${issue.detail}`)
          .join(' | ')}`,
        sources: [],
      });
    }
    if (args.probe) {
      probe = probeDeclaredIdentifierResolution({
        identityDir: args.targetDir,
        asOf: args.asOf ?? today(),
        financialCoverage: financialCoverageFromLocalDataset(args.dataRoot ?? undefined),
      });
      for (const conflict of probe.issuerKeyConflicts) {
        refusals.push({
          code: 'MERGED_SET_INVALID',
          subject: conflict.observationId,
          detail: `ISSUER_KEY_CONFLICT while resolving ${conflict.observationId}: ${conflict.reason ?? 'unspecified'}`,
          sources: [],
        });
      }
    }
    return finish({
      mode: args.mode,
      asOf: args.asOf ?? today(),
      targetDir: args.targetDir,
      sources: reportSources,
      mergeResult,
      planned,
      publication,
      verification,
      probe,
      refusals,
      report: args.report,
    });
  }

  // Read and validate each source set through the existing validators before anything is merged.
  const sets: IdentitySourceSet[] = [];
  for (const dir of args.sources) {
    const read = readIdentitySourceSet(dir);
    if (!read.ok) {
      refusals.push(...read.refusals);
      continue;
    }
    sets.push(read.set);
    reportSources.push({
      dir: read.set.dir,
      label: read.set.label,
      rosterLabel: read.set.rosterLabel,
      dataClass: read.set.dataClass,
      files: PROVISION_FILE_KEYS.map((key) => ({
        fileName: read.set.files[key].fileName,
        path: read.set.files[key].path,
        bytes: read.set.files[key].bytes,
        sha256: read.set.files[key].sha256,
      })),
    });
  }

  if (refusals.length === 0) {
    mergeResult = mergeIdentitySourceSets(sets);
    refusals.push(...mergeResult.refusals);
    if (mergeResult.ok && mergeResult.candidate !== null && mergeResult.candidateSha256 !== null && mergeResult.candidateBytes !== null) {
      planned = planPublication({
        targetDir: args.targetDir,
        candidate: mergeResult.candidate,
        candidateSha256: mergeResult.candidateSha256,
        candidateBytes: mergeResult.candidateBytes,
      });
      refusals.push(...planned.refusals);

      if (args.mode === 'EXECUTE' && planned.refusals.length === 0) {
        const outcome = publishIdentitySources({
          targetDir: args.targetDir,
          candidate: mergeResult.candidate,
          candidateSha256: mergeResult.candidateSha256,
          plan: planned,
        });
        publication = {
          published: outcome.published,
          replacedExisting: outcome.replacedExisting,
          rolledBack: outcome.rolledBack,
          rolledBackDetail: outcome.rolledBackDetail,
          files: outcome.files.map((file) => ({
            fileName: file.fileName,
            path: file.path,
            action: file.action,
            sha256: file.sha256,
            bytes: file.bytes,
          })),
        };
        refusals.push(...outcome.refusals);
        verification = outcome.verification;
      }
    }
  }

  if (args.probe) {
    probe = probeDeclaredIdentifierResolution({
      identityDir: args.targetDir,
      asOf: args.asOf ?? today(),
      financialCoverage: financialCoverageFromLocalDataset(args.dataRoot ?? undefined),
    });
  }

  return finish({
    mode: args.mode,
    asOf: args.asOf ?? today(),
    targetDir: args.targetDir,
    sources: reportSources,
    mergeResult,
    planned,
    publication,
    verification,
    probe,
    refusals,
    report: args.report,
  });
}

function finish(input: {
  readonly mode: ProvisionMode;
  readonly asOf: string;
  readonly targetDir: string;
  readonly sources: readonly ProvisionReportSource[];
  readonly mergeResult: ReturnType<typeof mergeIdentitySourceSets> | null;
  readonly planned: PublicationPlan | null;
  readonly publication: ProvisionReport['publication'];
  readonly verification: ProvisionReport['verification'];
  readonly probe: ResolutionProbe | null;
  readonly refusals: readonly ProvisionRefusal[];
  readonly report: string | null;
}): ProvisionReport {
  const mergeResult = input.mergeResult;
  const planned = input.planned;
  const published = input.publication?.published === true;
  const verifiedAvailable = input.verification?.available === true;

  // Success means something different per mode, and each reading is stated rather than implied.
  const ok =
    input.refusals.length === 0 &&
    (input.mode === 'PREFLIGHT'
      ? mergeResult?.ok === true && planned !== null && planned.governed
      : input.mode === 'EXECUTE'
        ? published && verifiedAvailable
        : verifiedAvailable);

  const attestation = attestationFor({
    mode: input.mode,
    published: input.publication?.published === true,
    rolledBack: input.publication?.rolledBack === true,
    wroteReport: input.report !== null,
    reportPath: input.report,
  });

  const build = (wroteReport: boolean): ProvisionReport => ({
    reportVersion: PROVISION_REPORT_VERSION,
    mode: input.mode,
    asOf: input.asOf,
    targetDir: input.targetDir,
    governed: planned?.governed ?? assertGovernedIdentityDir(input.targetDir) === null,
    sources: input.sources,
    merge: {
      attempted: input.mode !== 'VERIFY_ONLY',
      ok: mergeResult?.ok === true,
      counts: mergeResult?.counts ?? { sources: 0, issuers: 0, securities: 0, listings: 0, actions: 0 },
      rosterLabel: mergeResult?.rosterLabel ?? null,
      candidateSha256: mergeResult?.candidateSha256 ?? null,
      candidateBytes: mergeResult?.candidateBytes ?? null,
      sourceRosterLabels: mergeResult?.sourceRosterLabels ?? [],
      disclosures: mergeResult?.disclosures ?? [],
    },
    plan:
      planned === null
        ? null
        : {
            wouldChange: planned.wouldChange,
            files: planned.files.map((file) => ({
              fileName: file.fileName,
              path: file.path,
              action: file.action,
              candidateSha256: file.candidateSha256,
              candidateBytes: file.candidateBytes,
              existingSha256: file.existingSha256,
              existingBytes: file.existingBytes,
            })),
          },
    publication: input.publication,
    verification: input.verification,
    probe: input.probe,
    refusals: input.refusals,
    readOnlyAttestation: wroteReport
      ? attestationFor({
          mode: input.mode,
          published: input.publication?.published === true,
          rolledBack: input.publication?.rolledBack === true,
          wroteReport: true,
          reportPath: input.report,
        }).text
      : attestation.text,
    attestationClass: attestation.klass,
    ok,
  });

  // The report file, when asked for, records the same facts stdout does. Its write is the ONLY write a non-EXECUTE
  // mode performs, and the attestation names it rather than leaving the run to claim blanket read-only.
  if (input.report !== null) {
    const path = resolve(input.report);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(build(true), null, 2)}\n`, 'utf8');
    return build(true);
  }
  return build(false);
}

/** Render the report as the operator sees it. Every digest printed here comes from bytes this run read or wrote. */
export function renderReport(report: ProvisionReport): string {
  const lines: string[] = [];
  lines.push(`mode           ${report.mode}${report.mode === 'PREFLIGHT' ? ' (read-only; the default)' : ''}`);
  lines.push(`asOf           ${report.asOf}`);
  lines.push(`target         ${report.targetDir}`);
  lines.push(`governed       ${report.governed ? 'yes — <dataRoot>/investment/identity' : 'NO — refused'}`);

  if (report.sources.length > 0) {
    lines.push('');
    lines.push(`sources        ${report.sources.length} operator-supplied identity source set(s)`);
    for (const source of report.sources) {
      lines.push(`  ${source.dir}`);
      lines.push(`    rosterLabel  ${source.rosterLabel}`);
      lines.push(`    dataClass    ${source.dataClass}`);
      for (const file of source.files) {
        lines.push(`    ${file.fileName.padEnd(24)} ${String(file.bytes).padStart(7)} bytes  sha256:${file.sha256}`);
      }
    }
  }

  lines.push('');
  if (!report.merge.attempted) {
    lines.push(
      `merge          not attempted (${report.mode} reads the published set only; no source was read or merged)`,
    );
  } else {
  lines.push(`merge          ${report.merge.ok ? 'accepted' : 'REFUSED'}`);
  lines.push(
    `  records      ${report.merge.counts.issuers} issuer(s), ${report.merge.counts.securities} security(ies), `
      + `${report.merge.counts.listings} listing(s), ${report.merge.counts.actions} corporate action(s) `
      + `from ${report.merge.counts.sources} source set(s)`,
  );
  if (report.merge.rosterLabel !== null) lines.push(`  rosterLabel  ${report.merge.rosterLabel}`);
  if (report.merge.candidateSha256 !== null) {
    lines.push('  candidate digests (bytes this run would publish):');
    for (const key of PROVISION_FILE_KEYS) {
      const bytes = report.merge.candidateBytes?.[key] ?? 0;
      lines.push(
        `    ${FILE_NAME_OF_KEY[key].padEnd(24)} ${String(bytes).padStart(7)} bytes  sha256:${report.merge.candidateSha256[key]}`,
      );
    }
  }
  for (const disclosure of report.merge.disclosures) lines.push(`  disclosure   ${disclosure}`);
  }

  if (report.plan !== null) {
    lines.push('');
    lines.push(`plan           ${report.plan.wouldChange ? 'the published set WOULD change' : 'the published set is already identical — nothing would change'}`);
    for (const file of report.plan.files) {
      lines.push(`  ${file.fileName.padEnd(24)} ${file.action.padEnd(9)} candidate sha256:${file.candidateSha256}`);
      lines.push(
        `  ${''.padEnd(24)} ${''.padEnd(9)} existing  ${file.existingSha256 === null ? '(absent)' : `sha256:${file.existingSha256}`}`,
      );
    }
  }

  if (report.publication !== null) {
    lines.push('');
    lines.push(`publication    ${report.publication.published ? 'PUBLISHED and verified' : 'NOT PUBLISHED'}`);
    lines.push(`  replaced     ${report.publication.replacedExisting ? 'an existing published set was moved aside' : 'no existing set'}`);
    lines.push(`  rolledBack   ${report.publication.rolledBack ? `YES — ${report.publication.rolledBackDetail ?? ''}` : 'no'}`);
    for (const file of report.publication.files) {
      lines.push(`  ${file.fileName.padEnd(24)} ${file.action.padEnd(9)} ${String(file.bytes).padStart(7)} bytes  sha256:${file.sha256}`);
    }
  }

  if (report.verification !== null) {
    lines.push('');
    lines.push(`verification   ${report.verification.available ? 'the published set LOADS through the existing identity loader' : 'the published set DOES NOT LOAD'}`);
    if (report.verification.available) {
      lines.push(`  rosterLabel  ${report.verification.rosterLabel}`);
      lines.push(`  dataClass    ${report.verification.rosterDataClass}`);
      lines.push(
        `  records      ${report.verification.issuers} issuer(s), ${report.verification.securities} security(ies), `
          + `${report.verification.listings} listing(s), ${report.verification.actions} corporate action(s)`,
      );
      lines.push(`  rosterVersion              ${report.verification.rosterVersion}`);
      lines.push(`  listingMapVersion          ${report.verification.listingMapVersion}`);
      lines.push(`  corporateActionTableVersion ${report.verification.corporateActionTableVersion}`);
    } else {
      for (const issue of report.verification.issues) {
        lines.push(`  ${issue.file} ${issue.code} [${issue.subject}] ${issue.detail}`);
      }
    }
  }

  if (report.probe !== null) {
    const probe = report.probe;
    lines.push('');
    lines.push(`resolution     ${probe.sourcesAvailable ? 'probed' : 'NOT PROBED — the identity sources do not load'}`);
    lines.push(`  probeClass   ${probe.probeClass}`);
    lines.push(`  note         ${probe.note}`);
    if (probe.sourcesAvailable) {
      lines.push(
        `  counts       observed ${probe.observed}, resolved ${probe.resolved}, assessable ${probe.assessable}, unresolved ${probe.unresolved}`,
      );
      lines.push(`  reconciliation  ${probe.resolved} + ${probe.unresolved} = ${probe.observed} observed`);
      // StateCounts also carries the aggregates `observed` and `assessable`; those are printed on the counts line,
      // so this line lists only the nine resolution states, and only the ones actually reached.
      const reached = RESOLUTION_STATES.filter((state) => (probe.stateCounts[state] ?? 0) > 0).map(
        (state) => `${state}=${probe.stateCounts[state]}`,
      );
      lines.push(`  states       ${reached.length === 0 ? 'none' : reached.join(', ')}`);
      lines.push(
        `  ISSUER_KEY_CONFLICT  ${
          probe.issuerKeyConflicts.length === 0
            ? 'none observed'
            : `${probe.issuerKeyConflicts.length} OBSERVED - ${probe.issuerKeyConflicts
                .map((item) => item.observationId)
                .join(', ')}`
        }`,
      );
      for (const item of probe.items) {
        lines.push(
          `  ${item.observationId.padEnd(46)} ${item.kind.padEnd(16)} ${item.state.padEnd(22)} `
            + `issuer=${item.issuerId ?? '-'} basis=${item.resolutionBasis ?? '-'}`,
        );
      }
    }
  }

  if (report.refusals.length > 0) {
    lines.push('');
    lines.push(`refusals       ${report.refusals.length}`);
    for (const item of report.refusals) {
      lines.push(`  ${item.code} [${item.subject}]`);
      lines.push(`    ${item.detail}`);
      if (item.sources.length > 0) lines.push(`    sources: ${item.sources.join(', ')}`);
    }
  }

  lines.push('');
  lines.push(report.readOnlyAttestation);
  lines.push(`RESULT         ${report.ok ? 'PASS' : 'FAIL'}`);
  lines.push(...renderMachineBlock(report));
  return `${lines.join('\n')}\n`;
}

/**
 * A stable, one-fact-per-line trailer for machine readers.
 *
 * The Windows host script re-hashes every source and published file with `Get-FileHash` and compares its own
 * digests against these. Parsing prose would make that cross-check depend on wording, so these lines are a
 * contract: `key value...`, with any path LAST because a path may contain spaces. A consumer that cannot find a
 * key must treat that as a failure, not as an absent fact.
 */
export function renderMachineBlock(report: ProvisionReport): string[] {
  const out: string[] = ['', '--- machine-readable ---'];
  out.push(`result ${report.ok ? 'PASS' : 'FAIL'}`);
  out.push(`mode ${report.mode}`);
  out.push(`governed ${report.governed ? 'true' : 'false'}`);
  out.push(`target ${report.targetDir}`);
  out.push(`source.count ${report.sources.length}`);
  for (const source of report.sources) {
    for (const file of source.files) {
      out.push(`source.digest ${file.sha256} ${file.bytes} ${file.path}`);
    }
    out.push(`source.class ${source.dataClass} ${source.dir}`);
  }
  out.push(`merge.attempted ${report.merge.attempted ? 'true' : 'false'}`);
  out.push(`merge.ok ${report.merge.ok ? 'true' : 'false'}`);
  out.push(`merge.issuers ${report.merge.counts.issuers}`);
  out.push(`merge.securities ${report.merge.counts.securities}`);
  out.push(`merge.listings ${report.merge.counts.listings}`);
  out.push(`merge.actions ${report.merge.counts.actions}`);
  if (report.merge.candidateSha256 !== null) {
    for (const key of PROVISION_FILE_KEYS) {
      out.push(
        `candidate.digest ${report.merge.candidateSha256[key]} ${report.merge.candidateBytes?.[key] ?? 0} ${FILE_NAME_OF_KEY[key]}`,
      );
    }
  }
  if (report.plan !== null) {
    out.push(`plan.wouldChange ${report.plan.wouldChange ? 'true' : 'false'}`);
    for (const file of report.plan.files) {
      out.push(`plan.action ${file.action} ${file.fileName}`);
      out.push(
        file.existingSha256 === null
          ? `existing.digest absent 0 ${file.fileName}`
          : `existing.digest ${file.existingSha256} ${file.existingBytes ?? 0} ${file.fileName}`,
      );
    }
  }
  if (report.publication !== null) {
    out.push(`publication.published ${report.publication.published ? 'true' : 'false'}`);
    out.push(`publication.rolledBack ${report.publication.rolledBack ? 'true' : 'false'}`);
    out.push(`publication.replacedExisting ${report.publication.replacedExisting ? 'true' : 'false'}`);
    for (const file of report.publication.files) {
      out.push(`published.digest ${file.sha256} ${file.bytes} ${file.path}`);
    }
  }
  if (report.verification !== null) {
    const v = report.verification;
    out.push(`verification.available ${v.available ? 'true' : 'false'}`);
    out.push(`verification.issuers ${v.issuers}`);
    out.push(`verification.securities ${v.securities}`);
    out.push(`verification.listings ${v.listings}`);
    out.push(`verification.actions ${v.actions}`);
    out.push(`verification.dataClass ${v.rosterDataClass ?? 'NONE'}`);
    out.push(`verification.rosterVersion ${v.rosterVersion ?? 'none'}`);
    out.push(`verification.listingMapVersion ${v.listingMapVersion ?? 'none'}`);
    out.push(`verification.corporateActionTableVersion ${v.corporateActionTableVersion ?? 'none'}`);
  }
  if (report.probe !== null) {
    const probe = report.probe;
    out.push(`probe.sourcesAvailable ${probe.sourcesAvailable ? 'true' : 'false'}`);
    out.push(`probe.class ${probe.probeClass}`);
    out.push(`probe.observed ${probe.observed}`);
    out.push(`probe.resolved ${probe.resolved}`);
    out.push(`probe.assessable ${probe.assessable}`);
    out.push(`probe.unresolved ${probe.unresolved}`);
    out.push(`probe.issuerKeyConflicts ${probe.issuerKeyConflicts.length}`);
    for (const item of probe.items) {
      out.push(`probe.item ${item.state} ${item.kind} ${item.resolutionBasis ?? 'none'} ${item.issuerId ?? 'none'} ${item.observationId}`);
    }
  }
  out.push(`refusal.count ${report.refusals.length}`);
  for (const item of report.refusals) {
    out.push(`refusal ${item.code} ${item.subject}`);
  }
  out.push(`attestation ${report.attestationClass}`);
  return out;
}

/** Run the CLI. Returns the process exit code; all output goes to stdout, refusals also to stderr. */
export function run(argv: readonly string[]): number {
  let args: ProvisionArgs;
  try {
    args = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`usage error: ${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }

  const report = plan(args);
  process.stdout.write(renderReport(report));
  if (!report.ok) {
    for (const item of report.refusals) {
      process.stderr.write(`REFUSED ${item.code} [${item.subject}]: ${item.detail}\n`);
    }
    if (report.refusals.length === 0) {
      process.stderr.write(`REFUSED: ${report.mode} did not reach a publishable, published-and-verified, or loadable state\n`);
    }
    return 1;
  }
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && /provision-identity\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  try {
    process.exitCode = run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
