/**
 * IID WI-2 (P2) — company discovery read transport (GET/HEAD only).
 *
 *   GET|HEAD /api/investment/companies?q=<name-or-identifier>   governed company matches
 *
 * ONE ROUTINE, NO WRITES. There is no route table entry for a mutating method; anything that is not GET/HEAD is
 * answered 405 before any source is read. Discovery cannot create a company, an assessment or an identity.
 *
 * INDEPENDENT OF COVERAGE. This reads only `loadRuntimeIdentitySources` — the versioned eligible roster, listing
 * map and corporate-action table. It never calls the holdings IPC provider or the watchlists service, so a
 * coverage 503 (IPD down, watchlists unreadable) cannot make discovery unavailable.
 *
 * FAIL-CLOSED, WITH ONE DELIBERATE EXCEPTION. If the identity files cannot be loaded the answer is 503 with the
 * file-level issues: there is no roster to search, and guessing would fabricate companies. But if the roster
 * loads and only the ASSESSMENT STORE is unavailable, the answer is still 200 with every match marked
 * `assessment: 'UNKNOWN'`. Suppressing discovery because the artifact store is down would repeat the coverage
 * coupling this work item exists to remove; claiming "no assessment" would be a lie. The third state is honest.
 *
 * NO LEAKS. Bodies carry roster facts and fixed reason strings only — no path, no owner pair, no SQL, no stack.
 */
import type http from 'node:http';

import { loadRuntimeIdentitySources } from '../../../iips-platform/src/investment/identity/runtime';
import type { SourceLoadResult } from '../../../iips-platform/src/investment/identity/sources';
import { resolveReportsOwnerContext, type ReportsOwnerContext } from '../reports-owner-resolver.js';
import { loadAuthoritativeNp04Persistence } from '../reports/persistence-port.js';
import { ASSESSMENT_REPORT_TYPE, createInvestmentArtifactService } from './investmentArtifacts.js';
import {
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
  availabilityFromInventory,
  directoryDisclosure,
  searchCompanies,
  type AssessmentInventory,
} from './companyDirectory.js';

export const DISCOVERY_ROUTES = Object.freeze([
  Object.freeze({
    id: 'company-discovery',
    pattern: '/api/investment/companies',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: 'Governed company matches from the eligible roster, with observed assessment availability.',
  }),
] as const);

export const DISCOVERY_TRANSPORT_SEMANTICS = Object.freeze({
  surface: 'IID-WI-2-P2',
  methods: Object.freeze(['GET', 'HEAD']),
  mutatingOperations: Object.freeze([]),
  createsArtifacts: false,
  constructsIdentifiers: false,
  classifiesSecurities: false,
  dependsOnCoverage: false,
  failureStatuses: Object.freeze([400, 405, 503]),
});

export const DISCOVERY_ERRORS = Object.freeze({
  methodNotAllowed: Object.freeze({ error: 'method-not-allowed' }),
  queryTooShort: Object.freeze({
    error: 'discovery-query-too-short',
    detail: Object.freeze({
      reason: `Enter at least ${String(MIN_QUERY_LENGTH)} characters of a company name or identifier.`,
    }),
  }),
  queryTooLong: Object.freeze({
    error: 'discovery-query-too-long',
    detail: Object.freeze({ reason: `A query may be at most ${String(MAX_QUERY_LENGTH)} characters.` }),
  }),
  identitySourcesUnavailable: Object.freeze({
    error: 'identity-sources-unavailable',
    detail: Object.freeze({
      reason: 'The governed identity files could not be loaded, so no company was matched.',
    }),
  }),
});

export const DISCOVERY_DISCLOSURES = Object.freeze({
  decisionSupportOnly: true,
  noTradeExecution: true,
  nonProduction: true,
  identitySource: 'Governed eligible roster. Names select a record; the record supplies the issuer identity.',
});

export interface DiscoveryTransportDependencies {
  /** Injected so the source-unavailable path is provable without touching files. */
  readonly loadSources?: () => SourceLoadResult;
  /** Injected so the store-unavailable path is provable without a store. */
  readonly loadInventory?: () => Promise<AssessmentInventory | null>;
  readonly today?: () => string;
}

export function isDiscoveryPath(url: string | undefined): boolean {
  return (url ?? '').split('?')[0] === '/api/investment/companies';
}

/**
 * Read the assessment inventory through the EXISTING artifact service.
 *
 * Any failure — no owner, no governed port, an integrity failure — yields null, which the directory renders as
 * `UNKNOWN`. It is never converted into "no assessments exist".
 */
export async function loadAssessmentInventory(
  deps: {
    readonly resolveOwner?: () => ReportsOwnerContext | null;
    readonly loadPort?: () => Promise<unknown>;
  } = {},
): Promise<AssessmentInventory | null> {
  try {
    const owner = (deps.resolveOwner ?? resolveReportsOwnerContext)();
    if (owner === null) return null;
    const port = await (deps.loadPort ?? loadAuthoritativeNp04Persistence)();
    if (port === null || port === undefined) return null;
    const service = createInvestmentArtifactService({
      port,
      owner: { tenantId: owner.tenantId, userId: owner.ownerUserId },
    });
    return availabilityFromInventory(service.inventory(ASSESSMENT_REPORT_TYPE));
  } catch {
    return null;
  }
}

function sendJson(res: http.ServerResponse, status: number, body: unknown, head: boolean): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(head ? undefined : JSON.stringify(body));
}

/** Read `q` without throwing on a malformed escape; a bad escape is an unusable query, not a crash. */
export function readQuery(url: string | undefined): string {
  const raw = (url ?? '').split('?')[1] ?? '';
  for (const pair of raw.split('&')) {
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    if (pair.slice(0, eq) !== 'q') continue;
    try {
      return decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '));
    } catch {
      return '';
    }
  }
  return '';
}

export async function handleDiscoveryRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: DiscoveryTransportDependencies = {},
): Promise<boolean> {
  if (!isDiscoveryPath(req.url)) return false;

  const method = (req.method ?? 'GET').toUpperCase();
  const head = method === 'HEAD';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, {
      Allow: DISCOVERY_TRANSPORT_SEMANTICS.methods.join(', '),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(method === 'OPTIONS' || head ? undefined : JSON.stringify(DISCOVERY_ERRORS.methodNotAllowed));
    return true;
  }

  const query = readQuery(req.url);
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    sendJson(res, 400, DISCOVERY_ERRORS.queryTooShort, head);
    return true;
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    sendJson(res, 400, DISCOVERY_ERRORS.queryTooLong, head);
    return true;
  }

  const loaded = (deps.loadSources ?? (() => loadRuntimeIdentitySources()))();
  if (!loaded.available) {
    sendJson(
      res,
      503,
      {
        ...DISCOVERY_ERRORS.identitySourcesUnavailable,
        issues: loaded.issues.map((issue) => ({ file: issue.file, code: issue.code, subject: issue.subject })),
      },
      head,
    );
    return true;
  }

  const inventory = await (deps.loadInventory ?? loadAssessmentInventory)();
  const asOf = (deps.today ?? (() => new Date().toISOString().slice(0, 10)))();
  const result = searchCompanies(trimmed, loaded.sources, { asOf, inventory });
  if (result.kind === 'invalid') {
    sendJson(
      res,
      400,
      result.reason === 'QUERY_TOO_SHORT' ? DISCOVERY_ERRORS.queryTooShort : DISCOVERY_ERRORS.queryTooLong,
      head,
    );
    return true;
  }

  sendJson(
    res,
    200,
    {
      status: 'OK',
      query: trimmed,
      matches: result.matches,
      totalMatched: result.totalMatched,
      truncated: result.truncated,
      directory: directoryDisclosure(loaded.sources, inventory),
      disclosures: DISCOVERY_DISCLOSURES,
    },
    head,
  );
  return true;
}
