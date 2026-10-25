/**
 * NP-06 Reports — typed read-only API client (IRR UI consumer, CV-51 / Option CV51-A).
 *
 * Authority: `IIPS-V3-REPORTS-NP06-CV51-UI-EXPOSURE-PA-DECISION-ACT-2026-10-25-01`
 * (operative upon publication) over the accepted NP-06 backend (`R1`/`R2`/`R3`/`F-7`).
 *
 * Scope — READ ONLY. This client addresses exactly the four qualified `GET` surfaces of
 * `frontend/server/reports-transport.ts`:
 *   GET /api/reports/context
 *   GET /api/reports/artifacts?limit=&cursor=
 *   GET /api/reports/artifacts/:reportId
 *   GET /api/reports/artifacts/:reportId/supersession
 * No creation, version-append, export, or generation surface is addressed (zero POST).
 *
 * Discipline (binding conditions C-CV51-02/-04/-05/-06/-07/-08):
 *   - Every request executes through `noAuthFetch` (`credentials: 'omit'`, `authorization`
 *     stripped). No client-supplied identity, tenant, owner, principal, or carrier field is
 *     ever constructed or transmitted; the only query parameters are `limit` and `cursor`.
 *   - Wire partition literals carried by `ownership` / context fields are validated for
 *     structural presence and then STRIPPED: returned view models carry only the governed
 *     scope posture token, never the raw partition strings, so they cannot reach the DOM.
 *   - `canonicalPayload` is carried verbatim (its canonical text plus its parsed JSON value
 *     for display). Nothing is recomputed, re-derived, or compared client-side — in
 *     particular `reportKey` is displayed as an opaque recorded value, never re-hashed.
 *   - Failures map onto a closed vocabulary (`ReportsFailureKind`) with static,
 *     operator-safe messages. Raw backend `detail` / `reason` strings, filesystem paths,
 *     SQLite errors, and stack traces are deliberately discarded and never carried.
 *   - Artifact availability is governed by the `/api/reports/artifacts` response itself;
 *     the `/context` response never overrides an artifact failure (C-CV51-08).
 *   - Nothing is persisted client-side (no local/session storage, IndexedDB, or cookies).
 */
import { noAuthFetch } from '../core/network/noAuthFetch';

/** Closed client failure vocabulary (C-CV51-07). The only failure surface of this client. */
export type ReportsFailureKind =
  | 'owner-context-unavailable'
  | 'persistence-unavailable'
  | 'service-unavailable'
  | 'not-found'
  | 'invalid-request'
  | 'transport-error'
  | 'network-unavailable'
  | 'invalid-envelope';

/** Static, operator-safe message per failure kind. Never derived from a response body. */
const FAILURE_MESSAGES: Readonly<Record<ReportsFailureKind, string>> = Object.freeze({
  'owner-context-unavailable':
    'Reports are unavailable because the server-owned Reports owner context is not established. No report data was read or fabricated.',
  'persistence-unavailable':
    'Reports are unavailable because the governed report store is not configured or reachable on the server. No report data was read or fabricated.',
  'service-unavailable': 'The governed Reports boundary is temporarily unavailable (HTTP 503).',
  'not-found':
    'Report not found. No governed report artifact is available for this identifier. Missing and non-owned identifiers are indistinguishable by design.',
  'invalid-request': 'Invalid report request (HTTP 400). Verify the report identifier or return to the Reports list.',
  'transport-error': 'Reports service encountered a transport error. No partial or synthetic report values are shown.',
  'network-unavailable': 'Unable to reach the local Reports transport. Ensure the server is running on loopback and retry.',
  'invalid-envelope':
    'The Reports transport returned an unreadable response envelope. Display failed closed without fabricating values.',
});

/**
 * Typed client failure. `status` is the HTTP status answered by the transport; `0` means the
 * request could not be made at all (network fault). `message` is always one of the static
 * operator-safe strings above — no backend `detail`/`reason` text is ever carried here.
 */
export class ReportsApiError extends Error {
  constructor(
    readonly kind: ReportsFailureKind,
    readonly status: number,
  ) {
    super(FAILURE_MESSAGES[kind]);
    this.name = 'ReportsApiError';
  }
}

/** Governed single-owner scope posture. Raw partition literals never enter view models. */
export type ReportsScopePosture = 'ESTABLISHED_SINGLE_OWNER';

/** Sanitized context view: partition literals from the wire are stripped (C-CV51-06). */
export interface ReportsContextView {
  readonly surfaceName: 'NP-06';
  readonly disposition: 'ESTABLISHED';
  readonly scope: ReportsScopePosture;
}

/**
 * Sanitized artifact view model. Mirrors the persisted `CanonicalReportArtifact` read shape
 * with `ownership` replaced by the governed scope posture token. `canonicalPayloadText` is
 * the verbatim canonical JSON text; `payload` is its parsed JSON value for display only.
 */
export interface ReportArtifactView {
  readonly reportId: string;
  readonly reportType: string;
  readonly portfolioId: string;
  readonly scenario: string | null;
  readonly parameters: Readonly<Record<string, string | number | boolean | null>> | null;
  readonly schemaVersion: number;
  readonly artifactVersion: number;
  readonly supersedesReportId: string | null;
  readonly generatedAt: string;
  readonly reportKey: string;
  readonly canonicalPayloadText: string;
  readonly payload: unknown;
  readonly provenance: {
    readonly engineOutputId: string;
    readonly entries: readonly { readonly name: string; readonly value: unknown }[];
  };
  readonly scope: ReportsScopePosture;
}

/** One page of current-head artifacts plus the opaque continuation cursor. */
export interface ReportsPage {
  readonly items: readonly ReportArtifactView[];
  readonly nextCursor: string | null;
}

/** Supersession chain view: the current head plus superseded history (newest first). */
export interface ReportSupersessionView {
  readonly current: ReportArtifactView;
  readonly history: readonly ReportArtifactView[];
}

const REPORT_KEY_PATTERN = /^[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

function invalidEnvelope(): never {
  throw new ReportsApiError('invalid-envelope', 200);
}

/** Flat schemaVersion-1 parameter values only (string | finite number | boolean | null). */
function toParameters(value: unknown): Readonly<Record<string, string | number | boolean | null>> | null {
  if (value === null) return null;
  if (!isRecord(value)) invalidEnvelope();
  const out: Record<string, string | number | boolean | null> = {};
  for (const [name, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry === null || typeof entry === 'string' || typeof entry === 'boolean') {
      out[name] = entry;
    } else if (typeof entry === 'number' && Number.isFinite(entry)) {
      out[name] = entry;
    } else {
      invalidEnvelope();
    }
  }
  return out;
}

/**
 * Validates one wire artifact and projects it onto the sanitized view model. The wire
 * `ownership` partition literals are checked for structural presence and then dropped;
 * any schema violation fails closed as `invalid-envelope` rather than rendering a
 * partially fabricated view.
 */
function toArtifactView(value: unknown): ReportArtifactView {
  if (!isRecord(value)) invalidEnvelope();
  const wire = value as Record<string, unknown>;

  // Partition literals are validated on the wire and stripped before the view model exists.
  const ownership = wire.ownership;
  if (!isRecord(ownership) || !isNonEmptyString(ownership.tenantId) || !isNonEmptyString(ownership.userId)) {
    invalidEnvelope();
  }

  if (
    !isNonEmptyString(wire.reportId) ||
    !isNonEmptyString(wire.reportType) ||
    !isNonEmptyString(wire.portfolioId) ||
    !isNonEmptyString(wire.generatedAt) ||
    typeof wire.reportKey !== 'string' ||
    !REPORT_KEY_PATTERN.test(wire.reportKey) ||
    !isPositiveInteger(wire.schemaVersion) ||
    !isPositiveInteger(wire.artifactVersion) ||
    !(wire.scenario === null || typeof wire.scenario === 'string') ||
    !(wire.supersedesReportId === null || isNonEmptyString(wire.supersedesReportId)) ||
    typeof wire.canonicalPayload !== 'string'
  ) {
    invalidEnvelope();
  }

  let payload: unknown;
  try {
    payload = JSON.parse(wire.canonicalPayload as string);
  } catch {
    invalidEnvelope();
  }

  const provenance = wire.provenance;
  if (!isRecord(provenance) || !isNonEmptyString(provenance.engineOutputId)) invalidEnvelope();
  const entries = Object.entries(provenance as Record<string, unknown>)
    .filter(([name]) => name !== 'engineOutputId')
    .map(([name, entry]) => ({ name, value: entry }));

  return {
    reportId: wire.reportId as string,
    reportType: wire.reportType as string,
    portfolioId: wire.portfolioId as string,
    scenario: wire.scenario as string | null,
    parameters: toParameters(wire.parameters),
    schemaVersion: wire.schemaVersion as number,
    artifactVersion: wire.artifactVersion as number,
    supersedesReportId: wire.supersedesReportId as string | null,
    generatedAt: wire.generatedAt as string,
    reportKey: wire.reportKey as string,
    canonicalPayloadText: wire.canonicalPayload as string,
    payload,
    provenance: { engineOutputId: provenance.engineOutputId as string, entries },
    scope: 'ESTABLISHED_SINGLE_OWNER',
  };
}

/** Reads only the closed `error` code of a failure body; `detail`/`reason` are discarded. */
async function readErrorCode(res: Response): Promise<string | null> {
  try {
    const body: unknown = await res.json();
    if (isRecord(body) && typeof body.error === 'string') return body.error;
    return null;
  } catch {
    return null; // unparseable failure body — the status alone still fails closed
  }
}

/** Maps a non-OK response onto the closed failure vocabulary (raw details discarded). */
async function toApiError(res: Response): Promise<ReportsApiError> {
  const code = await readErrorCode(res);
  if (res.status === 503) {
    if (code === 'owner-context-unavailable') return new ReportsApiError('owner-context-unavailable', 503);
    if (code === 'persistence-unavailable') return new ReportsApiError('persistence-unavailable', 503);
    return new ReportsApiError('service-unavailable', 503);
  }
  if (res.status === 502 || res.status === 504) return new ReportsApiError('network-unavailable', res.status);
  if (res.status === 404 && code === 'report-not-found') return new ReportsApiError('not-found', 404);
  if (res.status === 400) return new ReportsApiError('invalid-request', 400);
  return new ReportsApiError('transport-error', res.status);
}

/** Performs one credential-free GET; network faults become `network-unavailable`. */
async function getJson(url: string): Promise<{ res: Response; body: unknown }> {
  let res: Response;
  try {
    res = await noAuthFetch(url);
  } catch {
    throw new ReportsApiError('network-unavailable', 0);
  }
  if (!res.ok) throw await toApiError(res);
  try {
    return { res, body: (await res.json()) as unknown };
  } catch {
    throw new ReportsApiError('invalid-envelope', res.status);
  }
}

/**
 * Fetches the governed Reports context posture (GET /api/reports/context). The returned
 * view carries no partition literals. This result never substitutes for artifact
 * availability, which is governed by `fetchReportArtifacts` itself (C-CV51-08).
 */
export async function fetchReportsContext(baseUrl = ''): Promise<ReportsContextView> {
  const { body } = await getJson(`${baseUrl}/api/reports/context`);
  if (!isRecord(body) || !isRecord(body.data)) invalidEnvelope();
  const data = body.data as Record<string, unknown>;
  if (
    data.surfaceName !== 'NP-06' ||
    data.disposition !== 'ESTABLISHED' ||
    !isNonEmptyString(data.tenantId) ||
    !isNonEmptyString(data.ownerUserId)
  ) {
    invalidEnvelope();
  }
  return { surfaceName: 'NP-06', disposition: 'ESTABLISHED', scope: 'ESTABLISHED_SINGLE_OWNER' };
}

/**
 * Lists current-head artifacts for the server-established owner partition
 * (GET /api/reports/artifacts). Only `limit` and the opaque `cursor` are sent.
 */
export async function fetchReportArtifacts(
  options: { readonly limit?: number; readonly cursor?: string | null } = {},
  baseUrl = '',
): Promise<ReportsPage> {
  const params = new URLSearchParams();
  params.set('limit', String(options.limit ?? 25));
  if (options.cursor !== undefined && options.cursor !== null) params.set('cursor', options.cursor);
  const { body } = await getJson(`${baseUrl}/api/reports/artifacts?${params.toString()}`);
  if (!isRecord(body) || !Array.isArray(body.data)) invalidEnvelope();
  if (!(body.nextCursor === null || typeof body.nextCursor === 'string')) invalidEnvelope();
  return {
    items: (body.data as unknown[]).map((item) => toArtifactView(item)),
    nextCursor: body.nextCursor as string | null,
  };
}

/** Fetches one durable artifact version by its store-minted identifier. */
export async function fetchReportArtifact(reportId: string, baseUrl = ''): Promise<ReportArtifactView> {
  if (!isNonEmptyString(reportId)) throw new ReportsApiError('invalid-request', 400);
  const { body } = await getJson(`${baseUrl}/api/reports/artifacts/${encodeURIComponent(reportId)}`);
  if (!isRecord(body)) invalidEnvelope();
  return toArtifactView((body as Record<string, unknown>).data);
}

/** Fetches the supersession chain (current head + history) for any owned version. */
export async function fetchReportSupersession(reportId: string, baseUrl = ''): Promise<ReportSupersessionView> {
  if (!isNonEmptyString(reportId)) throw new ReportsApiError('invalid-request', 400);
  const { body } = await getJson(
    `${baseUrl}/api/reports/artifacts/${encodeURIComponent(reportId)}/supersession`,
  );
  if (!isRecord(body) || !isRecord(body.data)) invalidEnvelope();
  const data = body.data as Record<string, unknown>;
  if (!Array.isArray(data.history)) invalidEnvelope();
  return {
    current: toArtifactView(data.current),
    history: (data.history as unknown[]).map((item) => toArtifactView(item)),
  };
}
