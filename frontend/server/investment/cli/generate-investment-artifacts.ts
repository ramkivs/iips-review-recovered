#!/usr/bin/env tsx
/**
 * IID-3 — operator CLI: assessment → canonical artifact → governed persistence.
 *
 *   tsx server/investment/cli/generate-investment-artifacts.ts \
 *     --issuer <issuerId> --data-dir <datasetDir> [--identity-dir <dir>] [--db <path>] \
 *     [--owner-carrier <path>] [--generated-at <iso>] [--out <summary.json>] [--dry-run]
 *
 * THE SEQUENCE IS THE CONTRACT (roadmap IID-3 §E). Each step is recorded in the machine-readable summary,
 * and any failed step stops the sequence:
 *
 *   1 snapshot      read an operator dataset through IID-0's verified reader
 *   2 identity      load the IID-1 identity sources and resolve the requested issuer
 *   3 assessment    run the IID-2 engine (the ONLY analysis in this process)
 *   4 compose       transcribe the payload into canonical ReportContent (no re-derivation)
 *   5 validate      artifact + scope token, before the store is touched
 *   6 chain-head    read the existing chain head for this scope, or observe that none exists
 *   7 compare       content identity and input identity against the head
 *   8 persist       UNCHANGED (no write) or append a new version to the SAME chain
 *   9 verify        re-read and revalidate the whole chain after any write
 *
 * WHAT IT WILL NOT DO. It does not compute analysis, choose a valuation method, adjust an assumption,
 * synthesise a missing value, open a database, or fall back to a substitute store. If the governed
 * persistence boundary cannot be resolved it reports `PERSISTENCE_UNAVAILABLE` and writes nothing — the
 * same failure the read transport surfaces as HTTP 503.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { assessCompany } from '../../../../iips-platform/src/investment/assessment/engine';
import type { SectorName } from '../../../../iips-platform/src/investment/contracts/operatingMetrics';
import { loadIdentitySources, IDENTITY_FILE_NAMES } from '../../../../iips-platform/src/investment/identity/sources';
import { buildBinding, resolveIdentity } from '../../../../iips-platform/src/investment/identity/resolver';
import type {
  IdentityObservation,
  IdentitySources,
} from '../../../../iips-platform/src/investment/identity/types';
import { readDataset } from '../../../../iips-platform/src/investment/ingestion/writer';
import { assertScopeToken } from '../../../../iips-platform/src/investment/artifacts/scopeToken';
import { NP04_DATABASE_PATH_ENV, loadAuthoritativeNp04Persistence } from '../../reports/persistence-port.js';
import {
  REPORTS_OWNER_PATH_ENV,
  resolveReportsOwnerContext,
  type ReportsOwnerContext,
} from '../../reports-owner-resolver.js';
import {
  ASSESSMENT_REPORT_TYPE,
  composeAssessmentArtifact,
  type ComposedAssessment,
  type DatasetClass,
} from '../assessmentComposition.js';
import {
  InvestmentArtifactError,
  createInvestmentArtifactService,
  type InvestmentChainView,
  type InvestmentArtifactService,
  type RecordResult,
} from '../investmentArtifacts.js';

export const CLI_SCHEMA_VERSION = 1 as const;

export type CliStepStatus = 'OK' | 'SKIPPED' | 'FAILED';

export interface CliStep {
  readonly step: string;
  readonly status: CliStepStatus;
  readonly detail: string;
}

export interface CliSummary {
  readonly schemaVersion: typeof CLI_SCHEMA_VERSION;
  readonly status: 'OK' | 'FAILED';
  readonly generatedAt: string;
  readonly steps: readonly CliStep[];
  readonly dataset: {
    readonly dir: string;
    readonly datasetVersion: string;
    readonly contentDigest: string;
    readonly provider: string;
    readonly datasetClass: DatasetClass;
    readonly dataAsOf: string | null;
    readonly knownAsOf: string | null;
  } | null;
  readonly identity: {
    readonly state: string;
    readonly issuerId: string | null;
    readonly securityId: string | null;
    readonly listingId: string | null;
    readonly resolutionBasis: string | null;
    readonly bindingId: string | null;
    readonly rosterVersion: string | null;
    readonly listingMapVersion: string | null;
    readonly corporateActionTableVersion: string | null;
  } | null;
  readonly assessment: {
    readonly modelVersion: string;
    readonly policyVersion: string;
    readonly adequacy: string;
    readonly qualityVerdict: string;
    readonly confidence: number;
    readonly methodCount: number;
    readonly withheldMethodCount: number;
    readonly missingFieldCount: number;
    readonly evidenceCount: number;
    readonly limitationCount: number;
  } | null;
  readonly artifact: {
    readonly reportType: string;
    readonly scopeToken: string;
    readonly reportKey: string;
    readonly payloadDigest: string;
    readonly inputDigest: string;
    readonly outcome: string;
    readonly wrote: boolean;
    readonly reportId: string | null;
    readonly artifactVersion: number | null;
    readonly chainRootReportId: string | null;
    readonly versionCount: number;
  } | null;
  readonly chain: {
    readonly versionCount: number;
    readonly versions: readonly {
      readonly reportId: string;
      readonly artifactVersion: number;
      readonly payloadDigest: string;
      readonly inputDigest: string;
      readonly generatedAt: string;
    }[];
  } | null;
  readonly limitations: readonly string[];
  readonly failure: { readonly code: string; readonly message: string } | null;
}

export interface CliDependencies {
  readonly env?: NodeJS.ProcessEnv;
  /** Resolve the governed persistence boundary. Injected so tests can prove the fail-closed path. */
  readonly loadPort?: () => Promise<unknown>;
  /** Resolve the owner context. Injected for the same reason. */
  readonly resolveOwner?: (env: NodeJS.ProcessEnv) => ReportsOwnerContext | null;
  readonly now?: () => Date;
}

interface CliArgs {
  readonly issuer: string;
  readonly dataDir: string;
  readonly identityDir: string;
  readonly generatedAt: string;
  readonly out: string | null;
  readonly dryRun: boolean;
  readonly dbPath: string | null;
  readonly carrierPath: string | null;
}

class CliFailure extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'CliFailure';
  }
}

export function parseArgs(argv: readonly string[]): CliArgs {
  const get = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv[index + 1];
  };
  const issuer = get('--issuer');
  const dataDir = get('--data-dir');
  if (issuer === undefined || dataDir === undefined) {
    throw new CliFailure(
      'USAGE',
      'usage: generate-investment-artifacts.ts --issuer <issuerId> --data-dir <datasetDir> ' +
        '[--identity-dir <dir>] [--db <path>] [--owner-carrier <path>] [--generated-at <iso>] [--out <file>] [--dry-run]',
    );
  }
  const env = process.env;
  const identityDir =
    get('--identity-dir') ??
    resolve(env.IIPS_DATA_DIR ?? resolve(process.cwd(), '.iips-data'), 'investment', 'identity');
  return {
    issuer,
    dataDir: resolve(dataDir),
    identityDir: resolve(identityDir),
    generatedAt: get('--generated-at') ?? new Date().toISOString(),
    out: get('--out') === undefined ? null : resolve(get('--out')!),
    dryRun: argv.includes('--dry-run'),
    dbPath: get('--db') ?? null,
    carrierPath: get('--owner-carrier') ?? null,
  };
}

/** Build the observation the resolver is asked about, from the roster and listing map themselves. */
function observationForIssuer(
  issuerId: string,
  sources: IdentitySources,
  asOf: string,
): IdentityObservation | null {
  const issuer = sources.roster.issuers.find((entry) => entry.issuerId === issuerId);
  if (issuer === undefined) return null;
  const securities = sources.roster.securities.filter(
    (entry) => entry.issuerId === issuerId && entry.status === 'ASSESSABLE',
  );
  const security = securities[0];
  const listing = sources.listingMap.entries.find(
    (entry) =>
      (security === undefined || entry.securityId === security.securityId) &&
      (entry.effectiveTo === null || entry.effectiveTo >= asOf) &&
      entry.effectiveFrom <= asOf,
  );
  return {
    observationId: `cli-${issuerId}`,
    source: 'WATCHLIST',
    isin: issuer.equityIsin ?? security?.isin ?? null,
    symbol: listing?.symbol ?? null,
    exchange: listing?.exchange ?? null,
    series: listing?.series ?? null,
    cin: issuer.cin,
    companyIdHint: null,
    displayName: issuer.legalName,
    portfolioId: null,
    quantity: null,
    upstreamStatus: null,
    raw: { issuerId, isin: issuer.equityIsin ?? null, symbol: listing?.symbol ?? null },
  };
}

/** Read the three identity files and label their provenance class. */
function loadSources(dir: string, dataClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED') {
  const paths = {
    roster: join(dir, IDENTITY_FILE_NAMES.roster),
    listingMap: join(dir, IDENTITY_FILE_NAMES.listingMap),
    corporateActions: join(dir, IDENTITY_FILE_NAMES.corporateActions),
  };
  const missing = Object.entries(paths)
    .filter(([, path]) => !existsSync(path))
    .map(([, path]) => path);
  if (missing.length > 0) {
    throw new CliFailure('IDENTITY_SOURCES_MISSING', `identity source file(s) missing: ${missing.join(', ')}`);
  }
  const result = loadIdentitySources({
    roster: readFileSync(paths.roster, 'utf8'),
    listingMap: readFileSync(paths.listingMap, 'utf8'),
    corporateActions: readFileSync(paths.corporateActions, 'utf8'),
    dataClass,
  });
  if (!result.available) {
    throw new CliFailure(
      'IDENTITY_SOURCES_INVALID',
      `identity sources failed validation: ${result.issues.map((issue) => `${issue.code} ${issue.subject}`).join('; ')}`,
    );
  }
  return result.sources;
}

function summarise(chain: InvestmentChainView | null): CliSummary['chain'] {
  if (chain === null) return null;
  return {
    versionCount: chain.versionCount,
    versions: chain.versions.map((version) => ({
      reportId: version.reportId,
      artifactVersion: version.artifactVersion,
      payloadDigest: version.payloadDigest,
      inputDigest: version.inputDigest,
      generatedAt: version.generatedAt,
    })),
  };
}

/**
 * Run the CLI. Returns the summary and an exit code; never throws for an expected failure.
 *
 * The summary is the machine-readable contract: a caller can assert on `status`, on each step's status, and
 * on the four identities without parsing prose.
 */
export async function runCli(
  argv: readonly string[],
  deps: CliDependencies = {},
): Promise<{ readonly exitCode: number; readonly summary: CliSummary }> {
  const env = deps.env ?? process.env;
  const now = deps.now ?? ((): Date => new Date());
  const steps: CliStep[] = [];
  const limitations = [
    'L-001 3 of 13 sectors measured; 10 remain in outstandingSectors (sector-analytics coverage, not this milestone)',
    'L-002 20 XBRL tags mapped; unmapped tags remain visible gaps',
    'L-003 closed derivation set = 8 items',
    'L-004 the reference dataset is synthetic: mechanics only, no company validation',
    'L-009 no real issuer has been assessed through IID-3; M-1 uses synthetic reference data',
    'L-010 investment artifact chains are validated by scan; NP-04 exposes no find-by-chain operation',
    'L-011 two scope namespaces exist: co:/hd:/hc:/icr: chain scope vs the payload subjectScope',
    'L-012 the chain root reportId stands in for NP-04 chainId, which the canonical artifact shape omits',
    'L-013 idempotency is decided against the chain HEAD only, not against arbitrary historical versions',
  ];

  let generatedAt = now().toISOString();
  let dataset: CliSummary['dataset'] = null;
  let identity: CliSummary['identity'] = null;
  let assessment: CliSummary['assessment'] = null;
  let artifact: CliSummary['artifact'] = null;
  let chain: CliSummary['chain'] = null;

  try {
    const args = parseArgs(argv);
    generatedAt = args.generatedAt;
    const asOf = generatedAt.slice(0, 10);

    // ---- 1 snapshot -------------------------------------------------------------------------
    let datasetRead;
    try {
      datasetRead = readDataset(args.dataDir);
    } catch (cause) {
      throw new CliFailure('DATASET_UNAVAILABLE', cause instanceof Error ? cause.message : String(cause));
    }
    const manifest = datasetRead.manifest;
    const datasetClass: DatasetClass =
      manifest.provider.includes('synthetic') || manifest.provider.includes('fixture')
        ? 'SYNTHETIC_REFERENCE'
        : 'APPROVED_LOCAL_INGESTION';
    dataset = {
      dir: datasetRead.dir,
      datasetVersion: manifest.datasetVersion,
      contentDigest: manifest.contentDigest,
      provider: manifest.provider,
      datasetClass,
      dataAsOf: manifest.dataAsOf,
      knownAsOf: manifest.knownAsOf,
    };
    steps.push({ step: 'snapshot', status: 'OK', detail: `datasetVersion ${manifest.datasetVersion}` });

    // ---- 2 identity -------------------------------------------------------------------------
    const sources = loadSources(args.identityDir, datasetClass === 'SYNTHETIC_REFERENCE' ? 'SYNTHETIC_FIXTURE' : 'OPERATOR_SUPPLIED');
    const observation = observationForIssuer(args.issuer, sources, asOf);
    if (observation === null) {
      throw new CliFailure('ISSUER_NOT_IN_ROSTER', `issuer ${args.issuer} is not in the identity roster`);
    }
    const resolution = resolveIdentity(
      {
        observationId: observation.observationId,
        source: observation.source,
        isin: observation.isin,
        symbol: observation.symbol,
        exchange: observation.exchange,
        series: observation.series,
        cin: observation.cin,
        companyIdHint: observation.companyIdHint,
      },
      { sources, asOf },
    );
    const binding = buildBinding(observation, resolution, { sources, asOf });
    identity = {
      state: resolution.state,
      issuerId: resolution.issuerId,
      securityId: resolution.securityId,
      listingId: resolution.listingId,
      resolutionBasis: resolution.resolutionBasis,
      bindingId: binding.bindingId,
      rosterVersion: sources.versions.rosterVersion,
      listingMapVersion: sources.versions.listingMapVersion,
      corporateActionTableVersion: sources.versions.corporateActionTableVersion,
    };
    if (resolution.state !== 'RESOLVED') {
      throw new CliFailure(
        'IDENTITY_UNRESOLVED',
        `identity resolution returned ${resolution.state}${resolution.failure === null ? '' : ` (${resolution.failure.reason})`}`,
      );
    }
    if (resolution.issuerId !== args.issuer) {
      throw new CliFailure(
        'IDENTITY_MISMATCH',
        `resolved issuer ${String(resolution.issuerId)} does not match the requested issuer`,
      );
    }
    steps.push({ step: 'identity', status: 'OK', detail: `RESOLVED via ${resolution.resolutionBasis}` });

    // ---- 3 assessment -----------------------------------------------------------------------
    const issuerRecord = sources.roster.issuers.find((entry) => entry.issuerId === args.issuer)!;
    const engineResult = assessCompany({
      issuerId: args.issuer,
      legalName: issuerRecord.legalName,
      sector: issuerRecord.sector as SectorName,
      sectorSubsegment: issuerRecord.subSegment,
      securityId: resolution.securityId ?? args.issuer,
      dataset: datasetRead.content,
      datasetVersion: manifest.datasetVersion,
      contentDigest: manifest.contentDigest,
      provider: manifest.provider,
      identity: {
        bindingRef: binding.bindingId,
        rosterVersion: sources.versions.rosterVersion,
        listingMapVersion: sources.versions.listingMapVersion,
        corporateActionTableVersion: sources.versions.corporateActionTableVersion,
      },
      generatedAt,
      knownAsOf: manifest.knownAsOf ?? generatedAt,
    });
    const payload = engineResult.payload;
    assessment = {
      modelVersion: payload.artifact.modelVersion,
      policyVersion: payload.artifact.policyVersion,
      adequacy: payload.completeness.adequacy,
      qualityVerdict: payload.quality.verdict,
      confidence: payload.confidence.combined,
      methodCount: payload.valuation.methods.length,
      // A method is "withheld" when the engine produced no output for it: either it is not applicable in
      // this sector or its metric-qualified inputs were unavailable. Both are reported, never imputed.
      withheldMethodCount: payload.valuation.methods.filter((method) => method.output === null).length,
      missingFieldCount: payload.completeness.missingFields.length,
      evidenceCount: payload.evidence.length,
      limitationCount: payload.limitations.length,
    };
    if (engineResult.violations.length > 0) {
      throw new CliFailure(
        'ASSESSMENT_INVARIANTS_FAILED',
        `${engineResult.violations.length} engine invariant violation(s); refusing to persist an invalid assessment`,
      );
    }
    steps.push({
      step: 'assessment',
      status: 'OK',
      detail: `${payload.completeness.adequacy} / ${payload.quality.verdict} / confidence ${payload.confidence.combined.toFixed(4)}`,
    });

    // ---- 4 compose --------------------------------------------------------------------------
    let composed: ComposedAssessment;
    try {
      composed = composeAssessmentArtifact({
        payload,
        inputDigest: engineResult.inputDigest,
        generatedAt,
        datasetClass,
        violations: engineResult.violations,
      });
    } catch (cause) {
      throw new CliFailure('COMPOSITION_FAILED', cause instanceof Error ? cause.message : String(cause));
    }
    steps.push({
      step: 'compose',
      status: 'OK',
      detail: `reportKey ${composed.content.reportKey.slice(0, 12)}… payloadDigest ${composed.payloadDigest.slice(0, 12)}…`,
    });

    // ---- 5 validate -------------------------------------------------------------------------
    let scope;
    try {
      scope = assertScopeToken(composed.scopeToken);
      if (composed.content.portfolioId !== composed.scopeToken) {
        throw new Error('artifact portfolioId differs from the scope token');
      }
      if (composed.content.reportType !== ASSESSMENT_REPORT_TYPE) {
        throw new Error('artifact reportType is not the company-assessment report type');
      }
    } catch (cause) {
      throw new CliFailure('ARTIFACT_VALIDATION_FAILED', cause instanceof Error ? cause.message : String(cause));
    }
    steps.push({ step: 'validate', status: 'OK', detail: `scope ${scope.token} (${scope.subjectKind})` });

    // ---- store ------------------------------------------------------------------------------
    if (args.dryRun) {
      steps.push({ step: 'chain-head', status: 'SKIPPED', detail: 'dry run: no store access' });
      steps.push({ step: 'persist', status: 'SKIPPED', detail: 'dry run: nothing written' });
      artifact = {
        reportType: composed.reportType,
        scopeToken: composed.scopeToken,
        reportKey: composed.content.reportKey,
        payloadDigest: composed.payloadDigest,
        inputDigest: composed.inputDigest,
        outcome: 'DRY_RUN',
        wrote: false,
        reportId: null,
        artifactVersion: null,
        chainRootReportId: null,
        versionCount: 0,
      };
      return finish('OK', null);
    }

    // Owner context first: resolving a database path would otherwise create an empty store for a run that is
    // about to abort.
    const owner = (deps.resolveOwner ?? resolveReportsOwnerContext)(
      args.carrierPath === null ? env : { ...env, [REPORTS_OWNER_PATH_ENV]: args.carrierPath },
    );
    if (owner === null) {
      throw new CliFailure(
        'OWNER_CONTEXT_UNAVAILABLE',
        'no owner context is established; nothing is read or written (the transport reports this as 503)',
      );
    }
    const port = await (deps.loadPort ?? defaultLoadPort)(args, env);
    if (port === null) {
      throw new CliFailure(
        'PERSISTENCE_UNAVAILABLE',
        `the governed persistence boundary is unavailable (set ${NP04_DATABASE_PATH_ENV}); nothing was written`,
      );
    }

    let service: InvestmentArtifactService;
    try {
      service = createInvestmentArtifactService({
        port,
        owner: { tenantId: owner.tenantId, userId: owner.ownerUserId },
      });
    } catch (cause) {
      if (cause instanceof InvestmentArtifactError && cause.code === 'PERSISTENCE_UNAVAILABLE') {
        throw new CliFailure('PERSISTENCE_UNAVAILABLE', 'the governed persistence boundary is not usable');
      }
      throw cause;
    }

    // ---- 6 chain head -----------------------------------------------------------------------
    let headChain: InvestmentChainView | null = null;
    try {
      headChain = service.readChain(composed.scopeToken);
      steps.push({
        step: 'chain-head',
        status: 'OK',
        detail: `existing chain at version ${headChain.head.artifactVersion}`,
      });
    } catch (cause) {
      if (cause instanceof InvestmentArtifactError && cause.code === 'CHAIN_NOT_FOUND') {
        steps.push({ step: 'chain-head', status: 'OK', detail: 'no chain for this scope yet' });
      } else {
        throw cause;
      }
    }

    // ---- 7 compare --------------------------------------------------------------------------
    if (headChain !== null) {
      const head = headChain.head;
      const comparison =
        head.payloadDigest === composed.payloadDigest
          ? head.inputDigest === composed.inputDigest
            ? 'content and input identical'
            : 'input changed, content identical'
          : 'content changed';
      steps.push({ step: 'compare', status: 'OK', detail: comparison });
    } else {
      steps.push({ step: 'compare', status: 'SKIPPED', detail: 'no head to compare against' });
    }

    // ---- 8 persist --------------------------------------------------------------------------
    let record: RecordResult;
    try {
      record = service.recordAssessment(composed);
    } catch (cause) {
      if (cause instanceof InvestmentArtifactError) {
        throw new CliFailure(cause.code, cause.message);
      }
      throw cause;
    }
    steps.push({
      step: 'persist',
      status: 'OK',
      detail: `${record.outcome} (${record.wrote ? 'wrote' : 'no write'})`,
    });

    // ---- 9 verify ---------------------------------------------------------------------------
    const verified = service.readChain(composed.scopeToken);
    steps.push({
      step: 'verify',
      status: 'OK',
      detail: `chain valid: ${verified.versionCount} version(s), head v${verified.head.artifactVersion}`,
    });

    chain = summarise(verified);
    artifact = {
      reportType: composed.reportType,
      scopeToken: composed.scopeToken,
      reportKey: verified.reportKey,
      payloadDigest: composed.payloadDigest,
      inputDigest: composed.inputDigest,
      outcome: record.outcome,
      wrote: record.wrote,
      reportId: record.written?.reportId ?? record.head.reportId,
      artifactVersion: record.written?.artifactVersion ?? record.head.artifactVersion,
      chainRootReportId: verified.chainRootReportId,
      versionCount: verified.versionCount,
    };
    return finish('OK', null);
  } catch (cause) {
    const failure =
      cause instanceof CliFailure
        ? { code: cause.code, message: cause.message }
        : { code: 'UNEXPECTED', message: cause instanceof Error ? cause.message : String(cause) };
    steps.push({ step: 'abort', status: 'FAILED', detail: failure.code });
    return finish('FAILED', failure);
  }

  function finish(
    status: 'OK' | 'FAILED',
    failure: CliSummary['failure'],
  ): { exitCode: number; summary: CliSummary } {
    const summary: CliSummary = {
      schemaVersion: CLI_SCHEMA_VERSION,
      status,
      generatedAt,
      steps,
      dataset,
      identity,
      assessment,
      artifact,
      chain,
      limitations,
      failure,
    };
    return { exitCode: status === 'OK' ? 0 : 1, summary };
  }
}

/** Default boundary resolution: the same fail-closed loader the Reports transport uses. */
async function defaultLoadPort(args: CliArgs, env: NodeJS.ProcessEnv): Promise<unknown> {
  if (args.dbPath !== null) {
    // Deliberately NOT a construction path: the path is passed to the same loader, via the environment the
    // loader reads. IID-3 owns no database handle of its own.
    return loadAuthoritativeNp04PersistenceWithPath(args.dbPath, env);
  }
  return loadAuthoritativeNp04Persistence();
}

/**
 * Resolve the authoritative port for an explicit path.
 *
 * The loader reads its path from the environment and this module must not construct a store, so the path
 * is placed in the environment for the duration of the call and restored afterwards. Nothing else about
 * resolution changes: it is the same loader, the same package, the same adapter.
 */
async function loadAuthoritativeNp04PersistenceWithPath(
  dbPath: string,
  env: NodeJS.ProcessEnv,
): Promise<unknown> {
  const previous = env[NP04_DATABASE_PATH_ENV];
  env[NP04_DATABASE_PATH_ENV] = resolve(dbPath);
  try {
    return await loadAuthoritativeNp04Persistence();
  } finally {
    if (previous === undefined) delete env[NP04_DATABASE_PATH_ENV];
    else env[NP04_DATABASE_PATH_ENV] = previous;
  }
}

/** Write the summary to a file when asked, creating the parent directory. */
export function writeSummary(path: string, summary: CliSummary): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}

const invokedDirectly = process.argv[1] !== undefined && /generate-investment-artifacts\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  const argv = process.argv.slice(2);
  const outIndex = argv.indexOf('--out');
  const out = outIndex === -1 ? null : argv[outIndex + 1];
  void runCli(argv).then(({ exitCode, summary }) => {
    if (out !== null && out !== undefined) writeSummary(resolve(out), summary);
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    for (const step of summary.steps) {
      process.stderr.write(`${step.status.padEnd(7)} ${step.step.padEnd(12)} ${step.detail}\n`);
    }
    if (summary.failure !== null) process.stderr.write(`\n${summary.failure.code}: ${summary.failure.message}\n`);
    process.exitCode = exitCode;
  });
}
