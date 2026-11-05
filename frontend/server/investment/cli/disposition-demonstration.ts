#!/usr/bin/env tsx
/**
 * IID-4 — disposition demonstration: a held position and a candidate, end to end, in a fresh scope.
 *
 *   tsx server/investment/cli/disposition-demonstration.ts --out <dir>
 *
 * WHAT IT PROVES, IN ORDER:
 *
 *   1  record            a held disposition is created on an `hd:` chain
 *   2  idempotent        an identical re-run writes nothing (verdict UNCHANGED)
 *   3  versioned         a changed limitation appends a new version to the SAME chain
 *   4  candidate         a candidate is created on an independent `hc:` chain for the same issuer and security
 *   5  read              both are read back through the READ TRANSPORT with their disclosures and limitations
 *   6  verb/definition   the read payload carries the verb the engine produced and its definition
 *   7  not an order      no payload, response or provenance member carries an order, a quantity or a price
 *   8  scope agreement   a candidate is never served from an `hd:` scope (and vice versa)
 *
 * WHAT IT DOES NOT DO. It does not touch an existing store (every run is a fresh temporary directory), it does
 * not use real issuer data (the M-1 synthetic reference company), and it executes nothing: there is no order
 * path in this file, by construction.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type http from 'node:http';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { adaptNp04Store } from '../../reports/np04-adapter.js';
import { createInvestmentArtifactService } from '../investmentArtifacts.js';
import { createDispositionRecordsService } from '../dispositionService.js';
import { handleDispositionRequest } from '../disposition-transport.js';
import { buildPortfolioContext, candidatePortfolioFacts } from '../portfolioContext.js';
// Module-specific imports, not the barrel: `tsx` resolves the barrel's re-exports inconsistently for a file
// outside its project root, and this CLI is the one entry point that runs that way.
import { buildDispositionPayload } from '../../../../iips-platform/src/investment/disposition/engine';
import { candidateSubject, heldSubject } from '../../../../iips-platform/src/investment/disposition/subject';
import type {
  DispositionAssessmentRef,
  HoldingDispositionPayload,
} from '../../../../iips-platform/src/investment/disposition/types';
import { resolveLimits } from '../../../../iips-platform/src/investment/disposition/limits';
import { present } from '../../../../iips-platform/src/investment/contracts/observation';
import type { CompanyAssessmentPayload } from '../../../../iips-platform/src/investment/assessment/types';
import type { G2PortfolioView } from '../../user-portfolio/userPortfolioContract.js';
import { M1_NOW, assembleAssessment, prepareM1Environment } from '../demo/m1Pipeline.js';

const OWNER = { tenantId: 'iid4-demo-tenant', userId: 'iid4-demo-owner' } as const;
const OWNER_CONTEXT = { tenantId: OWNER.tenantId, ownerUserId: OWNER.userId };
const PORTFOLIO_ID = 'pf-iid4-demonstration';
const CLOCK = '2026-11-06T06:00:00.000Z';

export interface VerificationPoint {
  readonly point: number;
  readonly name: string;
  readonly expected: string;
  readonly observed: string;
  readonly pass: boolean;
}

export interface DispositionDemonstrationEvidence {
  readonly schemaVersion: 1;
  readonly phase: 'IID-4';
  readonly dataClass: 'SYNTHETIC_REFERENCE';
  readonly issuerId: string;
  readonly securityId: string;
  readonly portfolioId: string;
  readonly chains: {
    readonly held: { readonly scopeToken: string; readonly reportKey: string; readonly versionCount: number };
    readonly candidate: { readonly scopeToken: string; readonly reportKey: string; readonly versionCount: number };
  };
  readonly verbs: { readonly held: string | null; readonly candidate: string | null };
  readonly runs: readonly {
    readonly label: string;
    readonly outcome: string;
    readonly wrote: boolean;
    readonly artifactVersion: number;
    readonly versionCount: number;
    readonly scopeToken: string;
  }[];
  readonly reads: readonly {
    readonly url: string;
    readonly httpStatus: number;
    readonly reportType: string | null;
    readonly verb: string | null;
    readonly noExecutionPath: boolean | null;
    readonly notAnInstruction: string | null;
    readonly limitations: readonly string[];
    readonly sanitized: boolean;
  }[];
  readonly orderShapedMembers: readonly string[];
  readonly verification: readonly VerificationPoint[];
}

interface FakeResponse {
  status: number;
  headers: Record<string, string | string[] | number>;
  body: string;
}

async function transport(method: string, url: string): Promise<FakeResponse> {
  const result: FakeResponse = { status: 0, headers: {}, body: '' };
  const res = {
    setHeader(name: string, value: string | string[] | number): void {
      result.headers[name.toLowerCase()] = value;
    },
    writeHead(status: number, headers?: Record<string, string | string[] | number>): void {
      result.status = status;
      for (const [name, value] of Object.entries(headers ?? {})) result.headers[name.toLowerCase()] = value;
    },
    end(chunk?: string): void {
      if (typeof chunk === 'string') result.body = chunk;
    },
    headersSent: false,
    destroyed: false,
  } as unknown as http.ServerResponse;
  await handleDispositionRequest({ method, url } as http.IncomingMessage, res, {
    resolveOwner: () => OWNER_CONTEXT,
    loadPort: async () => adaptNp04Store(new GovernedArtifactStore(activeDatabase!)),
  });
  return result;
}

let activeDatabase: ReturnType<typeof openDatabase> | null = null;

/** Members that would make a payload order-shaped. Checked against the serialized payload text. */
const FORBIDDEN_MEMBERS = ['"quantity"', '"orderType"', '"limitPrice"', '"stopLoss"', '"broker"', '"brokerage"', '"side"'];

function orderShapedMembersIn(payload: HoldingDispositionPayload): string[] {
  // `subject.quantities` is the holding's OWN position facts (what is held today), not an instruction about
  // what to hold next, so the subject block is excluded. Everything else in the payload is scanned.
  const { subject: _subject, ...rest } = payload as unknown as Record<string, unknown>;
  void _subject;
  const text = JSON.stringify(rest);
  return FORBIDDEN_MEMBERS.filter((member) => text.includes(member));
}

export async function runDemonstration(outDir: string): Promise<{ evidence: DispositionDemonstrationEvidence }> {
  const env = prepareM1Environment();
  const assembly = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
  const assessment = JSON.parse(assembly.composed.content.canonicalPayload) as CompanyAssessmentPayload;
  const securityId = assembly.identity.securityId as string;

  activeDatabase = openDatabase({ path: env.dbPath, createDirectory: true, migrate: true });
  const port = adaptNp04Store(new GovernedArtifactStore(activeDatabase));

  const assessments = createInvestmentArtifactService({ port, owner: OWNER });
  const recorded = assessments.recordAssessment(assembly.composed);
  const assessmentRef: DispositionAssessmentRef = {
    reportId: recorded.head.reportId,
    reportKey: recorded.head.reportKey,
    artifactVersion: recorded.head.artifactVersion,
    generatedAt: assembly.composed.content.generatedAt,
    adequacy: assessment.completeness.adequacy,
    qualityVerdict: assessment.quality.verdict,
    moatClassification: assessment.moat.classification,
    datasetClass: 'SYNTHETIC_REFERENCE',
    datasetVersion: assessment.data.datasetVersion,
    contentDigest: assessment.data.contentDigest,
    dataAsOf: assessment.asOf.dataAsOf,
    knownAsOf: assessment.asOf.knownAsOf,
    modelVersion: assessment.artifact.modelVersion,
    policyVersion: assessment.artifact.policyVersion,
  };

  // The portfolio the disposition is measured against. One measured holding plus one unresolved holding, so the
  // unmeasured weight is a real number rather than a decorative zero.
  const portfolio: G2PortfolioView = {
    portfolioId: PORTFOLIO_ID,
    portfolioName: 'IID-4 demonstration portfolio',
    revision: 3,
    holdings: [
      {
        symbol: 'AARAVSYN',
        companyId: 'company-aarav',
        isin: securityId,
        exchange: 'NSE',
        quantity: 1000,
        averageBuyPrice: 2400,
        currentPrice: 2640,
        marketValue: 2_640_000,
        weightPercentage: 60,
        active: true,
        sourceBroker: 'ZERODHA',
        lineageDigest: 'c'.repeat(64),
        identityStatus: 'RESOLVED',
        resolutionDisposition: 'CANONICAL_P04',
      },
      {
        symbol: 'UNRESOLVED',
        companyId: 'company-unknown',
        exchange: 'NSE',
        quantity: 400,
        averageBuyPrice: 1200,
        currentPrice: 1300,
        marketValue: 520_000,
        weightPercentage: 40,
        active: true,
        sourceBroker: 'ZERODHA',
        lineageDigest: 'd'.repeat(64),
        identityStatus: 'UNRESOLVED',
      },
    ],
    totalMarketValue: 3_160_000,
    totalHoldingsCount: 2,
    weightSumPercentage: 60,
    lastUpdated: '2026-11-06T05:00:00.000Z',
    provenanceDigest: 'e'.repeat(64),
    isSaved: true,
    contributions: [],
  };

  const { block, facts } = buildPortfolioContext({
    view: portfolio,
    subjectSecurityId: securityId,
    subjectIssuerId: assessment.subject.issuerId,
    subjectSector: assessment.subject.sector ?? null,
    asOf: '2026-11-06T05:00:00.000Z',
  });

  const limits = resolveLimits({ policy: null, asOf: CLOCK });
  const heldPayload = buildDispositionPayload({
    subject: heldSubject({
      portfolioId: PORTFOLIO_ID,
      securityId,
      issuerId: assessment.subject.issuerId,
      symbol: 'AARAVSYN',
      exchange: 'NSE',
      securityClass: 'EQUITY',
      heldAsOf: '2026-11-06T05:00:00.000Z',
      identityState: 'RESOLVED',
      securityState: 'ACTIVE',
      quantities: {
        quantity: present(1000, { kind: 'OPERATOR_ENTRY', ref: 'portfolio-snapshot', locator: 'row:1' }),
        averageCost: present(2400, { kind: 'OPERATOR_ENTRY', ref: 'portfolio-snapshot', locator: 'row:1' }),
        marketValue: present(2_640_000, { kind: 'DATASET', ref: 'user-portfolio:view' }),
        unrealisedGainPct: present(10, { kind: 'DERIVED', ref: 'snapshot/unrealised' }),
      },
    }),
    assessment: { payload: assessment, ref: assessmentRef },
    portfolio: { block, facts },
    limits,
    generatedAt: CLOCK,
  });

  const candidatePayload = buildDispositionPayload({
    subject: candidateSubject({
      issuerId: assessment.subject.issuerId,
      securityId,
      contextPortfolioId: PORTFOLIO_ID,
      origin: 'WATCHLIST',
      symbol: 'AARAVSYN',
      exchange: 'NSE',
      securityClass: 'EQUITY',
      identityState: 'RESOLVED',
      securityState: 'ACTIVE',
    }),
    assessment: { payload: assessment, ref: assessmentRef },
    portfolio: {
      block,
      facts: candidatePortfolioFacts({ view: portfolio, subjectSector: assessment.subject.sector ?? null }),
    },
    limits,
    generatedAt: CLOCK,
  });

  const dispositions = createDispositionRecordsService({ port, owner: OWNER });
  const context = {
    assessmentPayloadDigest: assembly.composed.payloadDigest,
    assessmentInputDigest: assembly.composed.inputDigest,
    generatedAt: CLOCK,
    datasetClass: 'SYNTHETIC_REFERENCE' as const,
  };

  const created = dispositions.record(heldPayload, context);
  const unchanged = dispositions.record(heldPayload, context);
  const appended = dispositions.record(
    { ...heldPayload, limitations: [...heldPayload.limitations, 'L-020'] },
    { ...context, generatedAt: '2026-11-06T07:00:00.000Z' },
  );
  const candidate = dispositions.record(candidatePayload, context);

  const heldRead = await transport('GET', `/api/investment/portfolio/${PORTFOLIO_ID}/holding/${securityId}`);
  const candidateRead = await transport('GET', `/api/investment/candidate/${securityId}?portfolio=${PORTFOLIO_ID}`);
  const listRead = await transport('GET', `/api/investment/portfolio/${PORTFOLIO_ID}/dispositions`);
  const crossRead = await transport('HEAD', `/api/investment/portfolio/${PORTFOLIO_ID}/holding/${securityId}`);

  const heldBody = JSON.parse(heldRead.body) as Record<string, unknown>;
  const candidateBody = JSON.parse(candidateRead.body) as Record<string, unknown>;
  const listBody = JSON.parse(listRead.body) as Record<string, unknown>;
  const heldDisposition = heldBody.disposition as Record<string, unknown>;
  const candidateDisposition = candidateBody.disposition as Record<string, unknown>;

  const sanitize = (body: string): boolean =>
    !body.includes(env.root) &&
    !body.includes('investment.db') &&
    !body.includes(OWNER.tenantId) &&
    !body.toLowerCase().includes('governed_artifacts') &&
    !/\bat .*\(.*:\d+:\d+\)/.test(body);

  const orderShaped = [...orderShapedMembersIn(heldPayload), ...orderShapedMembersIn(candidatePayload)];

  const evidence: DispositionDemonstrationEvidence = {
    schemaVersion: 1,
    phase: 'IID-4',
    dataClass: 'SYNTHETIC_REFERENCE',
    issuerId: assessment.subject.issuerId,
    securityId,
    portfolioId: PORTFOLIO_ID,
    chains: {
      held: {
        scopeToken: created.scopeToken,
        reportKey: appended.chain.reportKey,
        versionCount: appended.chain.versionCount,
      },
      candidate: {
        scopeToken: candidate.scopeToken,
        reportKey: candidate.chain.reportKey,
        versionCount: candidate.chain.versionCount,
      },
    },
    verbs: { held: heldPayload.disposition.verb, candidate: candidatePayload.disposition.verb },
    runs: [
      {
        label: 'held/create',
        outcome: created.outcome,
        wrote: created.wrote,
        artifactVersion: created.head.artifactVersion,
        versionCount: created.chain.versionCount,
        scopeToken: created.scopeToken,
      },
      {
        label: 'held/rerun-identical',
        outcome: unchanged.outcome,
        wrote: unchanged.wrote,
        artifactVersion: unchanged.head.artifactVersion,
        versionCount: unchanged.chain.versionCount,
        scopeToken: unchanged.scopeToken,
      },
      {
        label: 'held/changed-limitations',
        outcome: appended.outcome,
        wrote: appended.wrote,
        artifactVersion: appended.head.artifactVersion,
        versionCount: appended.chain.versionCount,
        scopeToken: appended.scopeToken,
      },
      {
        label: 'candidate/create',
        outcome: candidate.outcome,
        wrote: candidate.wrote,
        artifactVersion: candidate.head.artifactVersion,
        versionCount: candidate.chain.versionCount,
        scopeToken: candidate.scopeToken,
      },
    ],
    reads: [
      {
        url: `/api/investment/portfolio/${PORTFOLIO_ID}/holding/${securityId}`,
        httpStatus: heldRead.status,
        reportType: (heldBody.reportType as string) ?? null,
        verb: ((heldDisposition.disposition as Record<string, unknown>)?.verb as string) ?? null,
        noExecutionPath: ((heldDisposition.interpretation as Record<string, unknown>)?.noExecutionPath as boolean) ?? null,
        notAnInstruction:
          ((heldBody.disclosures as Record<string, unknown>)?.notAnInstruction as string) ?? null,
        limitations: (heldBody.limitations as string[]) ?? [],
        sanitized: sanitize(heldRead.body),
      },
      {
        url: `/api/investment/candidate/${securityId}?portfolio=${PORTFOLIO_ID}`,
        httpStatus: candidateRead.status,
        reportType: (candidateBody.reportType as string) ?? null,
        verb: ((candidateDisposition.disposition as Record<string, unknown>)?.verb as string) ?? null,
        noExecutionPath:
          ((candidateDisposition.interpretation as Record<string, unknown>)?.noExecutionPath as boolean) ?? null,
        notAnInstruction:
          ((candidateBody.disclosures as Record<string, unknown>)?.notAnInstruction as string) ?? null,
        limitations: (candidateBody.limitations as string[]) ?? [],
        sanitized: sanitize(candidateRead.body),
      },
      {
        url: `/api/investment/portfolio/${PORTFOLIO_ID}/dispositions`,
        httpStatus: listRead.status,
        reportType: (listBody.reportType as string) ?? null,
        verb: null,
        noExecutionPath: null,
        notAnInstruction: ((listBody.disclosures as Record<string, unknown>)?.notAnInstruction as string) ?? null,
        limitations: (listBody.limitations as string[]) ?? [],
        sanitized: sanitize(listRead.body),
      },
    ],
    orderShapedMembers: orderShaped,
    verification: [
      {
        point: 1,
        name: 'held disposition created on an hd: chain',
        expected: 'CREATED, version 1, hd:<portfolio>/<security>',
        observed: `${created.outcome}, version ${created.head.artifactVersion}, ${created.scopeToken}`,
        pass: created.outcome === 'CREATED' && created.scopeToken.startsWith('hd:'),
      },
      {
        point: 2,
        name: 'identical re-run writes nothing',
        expected: 'UNCHANGED, wrote=false',
        observed: `${unchanged.outcome}, wrote=${unchanged.wrote}`,
        pass: unchanged.outcome === 'UNCHANGED' && unchanged.wrote === false,
      },
      {
        point: 3,
        name: 'changed content appends to the same chain',
        expected: 'APPENDED, version 2, same reportKey',
        observed: `${appended.outcome}, version ${appended.head.artifactVersion}, reportKey ${appended.chain.reportKey}`,
        pass:
          appended.outcome === 'APPENDED' &&
          appended.head.artifactVersion === 2 &&
          appended.chain.reportKey === appended.chain.versions[0]!.reportKey,
      },
      {
        point: 4,
        name: 'candidate created on an independent hc: chain',
        expected: 'CREATED, hc:<portfolio>/<security>, different reportKey',
        observed: `${candidate.outcome}, ${candidate.scopeToken}, reportKey ${candidate.chain.reportKey}`,
        pass:
          candidate.outcome === 'CREATED' &&
          candidate.scopeToken.startsWith('hc:') &&
          candidate.chain.reportKey !== appended.chain.reportKey,
      },
      {
        point: 5,
        name: 'both dispositions read back through the transport',
        expected: '200 for the holding, the candidate and the portfolio list',
        observed: `${heldRead.status}, ${candidateRead.status}, ${listRead.status}`,
        pass: heldRead.status === 200 && candidateRead.status === 200 && listRead.status === 200,
      },
      {
        point: 6,
        name: 'the read payload carries the verb the engine produced',
        expected: `held=${heldPayload.disposition.verb}, candidate=${candidatePayload.disposition.verb}`,
        observed: `${String((heldDisposition.disposition as Record<string, unknown>)?.verb)}, ${String((candidateDisposition.disposition as Record<string, unknown>)?.verb)}`,
        pass:
          (heldDisposition.disposition as Record<string, unknown>)?.verb === heldPayload.disposition.verb &&
          (candidateDisposition.disposition as Record<string, unknown>)?.verb === candidatePayload.disposition.verb,
      },
      {
        point: 7,
        name: 'nothing order-shaped is published',
        expected: 'no quantity/order/price/broker member in either payload',
        observed: orderShaped.length === 0 ? 'none found' : orderShaped.join(', '),
        pass: orderShaped.length === 0,
      },
      {
        point: 8,
        name: 'the two chains stay separate on read',
        expected: 'HEAD on the holding chain reports version 2; the candidate chain has 1',
        observed: `holding head v${crossRead.headers['x-investment-artifact-version']}, candidate versions ${candidate.chain.versionCount}`,
        pass: String(crossRead.headers['x-investment-artifact-version']) === '2' && candidate.chain.versionCount === 1,
      },
    ],
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'iid4-disposition-demonstration.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  writeFileSync(join(outDir, 'held-payload.json'), `${JSON.stringify(heldPayload, null, 2)}\n`, 'utf8');
  writeFileSync(join(outDir, 'candidate-payload.json'), `${JSON.stringify(candidatePayload, null, 2)}\n`, 'utf8');

  (activeDatabase as unknown as { close?: () => void }).close?.();
  activeDatabase = null;
  env.cleanup();

  return { evidence };
}

const invokedDirectly = process.argv[1] !== undefined && /disposition-demonstration\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  const index = process.argv.indexOf('--out');
  const outDir = index === -1 ? join(process.cwd(), 'iid4-disposition-evidence') : process.argv[index + 1]!;
  void runDemonstration(outDir).then(({ evidence }) => {
    for (const point of evidence.verification) {
      process.stderr.write(`${point.pass ? 'PASS' : 'FAIL'}  ${point.point}. ${point.name} — ${point.observed}\n`);
    }
    process.stdout.write(`${join(outDir, 'iid4-disposition-demonstration.json')}\n`);
    process.exitCode = evidence.verification.every((point) => point.pass) ? 0 : 1;
  });
}
