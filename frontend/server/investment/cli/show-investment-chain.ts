#!/usr/bin/env tsx
/**
 * IID-3 — operator CLI: read one investment artifact chain and print its identity.
 *
 *   tsx server/investment/cli/show-investment-chain.ts --issuer <issuerId> [--db <path>] \
 *     [--owner-carrier <path>] [--version <reportId>]
 *
 * This is the READ-ONLY sibling of `generate-investment-artifacts.ts`, and it exists for two reasons:
 *
 *   1. an operator can see what is stored without writing anything; and
 *   2. durability can be demonstrated by a SEPARATE PROCESS reading the store after the writer has exited.
 *      A same-process read would prove caching, not persistence.
 *
 * It prints identity, digests and counts — never the payload body, which is large and belongs to the transport.
 */
import { resolve } from 'node:path';

import { NP04_DATABASE_PATH_ENV, loadAuthoritativeNp04Persistence } from '../../reports/persistence-port.js';
import { REPORTS_OWNER_PATH_ENV, resolveReportsOwnerContext } from '../../reports-owner-resolver.js';
import { parseIssuerId } from '../../../../iips-platform/src/investment/contracts/ids';
import { companyScopeToken } from '../../../../iips-platform/src/investment/artifacts/scopeToken';
import { ASSESSMENT_REPORT_TYPE } from '../assessmentComposition.js';
import { InvestmentArtifactError, createInvestmentArtifactService } from '../investmentArtifacts.js';

export interface ShowChainOutput {
  readonly status: 'OK' | 'FAILED';
  readonly scopeToken: string | null;
  readonly reportType: string | null;
  readonly reportKey: string | null;
  readonly chainRootReportId: string | null;
  readonly versionCount: number;
  readonly head: {
    readonly reportId: string;
    readonly artifactVersion: number;
    readonly payloadDigest: string;
    readonly inputDigest: string;
    readonly generatedAt: string;
    readonly dataAsOf: string;
    readonly knownAsOf: string;
    readonly datasetVersion: string;
    readonly modelVersion: string;
    readonly adequacy: string;
    readonly qualityVerdict: string;
    readonly evidenceCount: number;
  } | null;
  readonly versions: readonly {
    readonly reportId: string;
    readonly artifactVersion: number;
    readonly supersedesReportId: string | null;
    readonly payloadDigest: string;
    readonly inputDigest: string;
    readonly generatedAt: string;
  }[];
  readonly payloadBytes: number | null;
  readonly failure: { readonly code: string; readonly message: string } | null;
}

export interface ShowChainDependencies {
  readonly env?: NodeJS.ProcessEnv;
  readonly loadPort?: () => Promise<unknown>;
  readonly resolveOwner?: (env: NodeJS.ProcessEnv) => { tenantId: string; ownerUserId: string } | null;
}

function arg(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

export async function runShowChain(
  argv: readonly string[],
  deps: ShowChainDependencies = {},
): Promise<{ readonly exitCode: number; readonly output: ShowChainOutput }> {
  const base: ShowChainOutput = {
    status: 'FAILED',
    scopeToken: null,
    reportType: null,
    reportKey: null,
    chainRootReportId: null,
    versionCount: 0,
    head: null,
    versions: [],
    payloadBytes: null,
    failure: null,
  };

  const issuerArg = arg(argv, '--issuer');
  if (issuerArg === undefined) {
    return { exitCode: 1, output: { ...base, failure: { code: 'USAGE', message: 'usage: show-investment-chain.ts --issuer <issuerId>' } } };
  }

  const env = deps.env ?? process.env;
  const dbPath = arg(argv, '--db');
  const carrierPath = arg(argv, '--owner-carrier');

  try {
    const issuerId = parseIssuerId(issuerArg);
    const scopeToken = companyScopeToken(issuerId);

    const owner = (deps.resolveOwner ?? resolveReportsOwnerContext)(
      carrierPath === undefined ? env : { ...env, [REPORTS_OWNER_PATH_ENV]: carrierPath },
    );
    if (owner === null) {
      return { exitCode: 1, output: { ...base, scopeToken, failure: { code: 'OWNER_CONTEXT_UNAVAILABLE', message: 'no owner context is established' } } };
    }

    let port: unknown;
    if (deps.loadPort !== undefined) {
      port = await deps.loadPort();
    } else if (dbPath !== undefined) {
      const previous = env[NP04_DATABASE_PATH_ENV];
      env[NP04_DATABASE_PATH_ENV] = resolve(dbPath);
      try {
        port = await loadAuthoritativeNp04Persistence();
      } finally {
        if (previous === undefined) delete env[NP04_DATABASE_PATH_ENV];
        else env[NP04_DATABASE_PATH_ENV] = previous;
      }
    } else {
      port = await loadAuthoritativeNp04Persistence();
    }
    if (port === null || port === undefined) {
      return { exitCode: 1, output: { ...base, scopeToken, failure: { code: 'PERSISTENCE_UNAVAILABLE', message: 'the governed persistence boundary is unavailable' } } };
    }

    const service = createInvestmentArtifactService({
      port,
      owner: { tenantId: owner.tenantId, userId: owner.ownerUserId },
    });
    const versionArg = arg(argv, '--version');
    const read =
      versionArg === undefined
        ? ((): { chain: ReturnType<typeof service.readChain>; payloadBytes: number } => {
            const chain = service.readChain(scopeToken, ASSESSMENT_REPORT_TYPE);
            const head = service.readVersionWithPayload(scopeToken, chain.head.reportId);
            return { chain, payloadBytes: Buffer.byteLength(head.payload, 'utf8') };
          })()
        : (() => {
            const one = service.readVersionWithPayload(scopeToken, versionArg, ASSESSMENT_REPORT_TYPE);
            return { chain: one.chain, payloadBytes: Buffer.byteLength(one.payload, 'utf8') };
          })();

    const chain = read.chain;
    const head = chain.head;
    return {
      exitCode: 0,
      output: {
        status: 'OK',
        scopeToken: chain.scopeToken,
        reportType: chain.reportType,
        reportKey: chain.reportKey,
        chainRootReportId: chain.chainRootReportId,
        versionCount: chain.versionCount,
        head: {
          reportId: head.reportId,
          artifactVersion: head.artifactVersion,
          payloadDigest: head.payloadDigest,
          inputDigest: head.inputDigest,
          generatedAt: head.generatedAt,
          dataAsOf: head.dataAsOf,
          knownAsOf: head.knownAsOf,
          datasetVersion: head.datasetVersion,
          modelVersion: head.modelVersion,
          adequacy: head.adequacy,
          qualityVerdict: head.qualityVerdict,
          evidenceCount: head.evidenceCount,
        },
        versions: chain.versions.map((version) => ({
          reportId: version.reportId,
          artifactVersion: version.artifactVersion,
          supersedesReportId: version.supersedesReportId,
          payloadDigest: version.payloadDigest,
          inputDigest: version.inputDigest,
          generatedAt: version.generatedAt,
        })),
        payloadBytes: read.payloadBytes,
        failure: null,
      },
    };
  } catch (error) {
    const failure =
      error instanceof InvestmentArtifactError
        ? { code: error.code, message: error.message }
        : { code: 'UNEXPECTED', message: error instanceof Error ? error.message : String(error) };
    return { exitCode: 1, output: { ...base, failure } };
  }
}

const invokedDirectly = process.argv[1] !== undefined && /show-investment-chain\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  void runShowChain(process.argv.slice(2)).then(({ exitCode, output }) => {
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    process.exitCode = exitCode;
  });
}
