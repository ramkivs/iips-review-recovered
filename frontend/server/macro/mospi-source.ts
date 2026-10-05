/**
 * Program v3.0 — NP-08 / D08 MACRO: governed MoSPI transport/source adapter.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  GOVERNANCE STATUS — READ BEFORE EDITING
 * ═══════════════════════════════════════════════════════════════════════════
 * Authorized by `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`:
 *   D1  D08 route-contract implementation ........ AUTHORIZED
 *   D2  create Macro surface on origin/main ...... AUTHORIZED
 *   D3  authentication ........................... OPTION A — throttled NO-AUTH
 *   D4  dependency/toolchain provisioning ........ AUTHORIZED
 *
 * Established separately — D08 provider designation:
 *   MoSPI provider designation ................... DESIGNATED — NAS/CPI/IIP only
 *
 * NOT granted here — each remains a SEPARATE governance gate:
 *   entitlement / commercial use ................. NOT GRANTED
 *   redistribution / caching / retention ......... NOT GRANTED
 *   M-3 provenance authority ..................... NOT ESTABLISHED
 *   production authorization ..................... NOT AUTHORIZED
 *   D08 boundary expansion ....................... NOT AUTHORIZED
 *
 * `MACRO_SOURCE_ID` below is a TECHNICAL SOURCE IDENTIFIER required to build
 * the governed request URL. It corresponds to the established MoSPI provider
 * designation for D08 NAS/CPI/IIP; it is NOT an entitlement, and it does NOT
 * imply any commercial or redistribution right.
 *
 * D08 boundary: NAS / CPI / IIP only. Nothing else may be added here.
 *
 * LIVE-ONLY: no snapshots, no stale fallback payloads, no synthetic
 * observations. Every record returned originates from a live MoSPI response.
 *
 * FAIL-CLOSED: an unavailable/invalid/partial response is an ERROR. It is
 * never silently downgraded into a set of valid observations.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** D08 Macro dataset boundary. Exhaustive — do not extend without governance. */
export type MacroDataset = 'NAS' | 'CPI' | 'IIP';

/** Technical source identifier for the designated D08 Macro provider. */
export const MACRO_SOURCE_ID = 'MoSPI';

/** The D08-approved dataset set. Extending this is a boundary expansion. */
export const APPROVED_DATASETS: readonly MacroDataset[] = ['NAS', 'CPI', 'IIP'];

/**
 * Implementation-level contract version tag. This is a CANDIDATE provenance
 * dimension only — it is NOT an M-3 governed field.
 */
export const MACRO_API_CONTRACT_VERSION = 'mospi-esankhyiki-rest-d08-2026-10';

/** MoSPI e-Sankhyiki REST base. Live-confirmed unauthenticated + throttled. */
export const MOSPI_REST_BASE_URL = 'https://api.mospi.gov.in';

const DATA_ENDPOINT: Readonly<Record<MacroDataset, string>> = {
  NAS: '/api/nas/getNASData',
  CPI: '/api/cpi/getCPIIndex',
  IIP: '/api/iip/getIipData',
};

/** IIP runtime metadata endpoint (category/subcategory enumeration). */
export const IIP_FILTER_ENDPOINT = '/api/iip/getIipFilter';

// ────────────────────────────────────────────────────────────────────────────
// NAS — explicit indicator selection (no implicit/default indicator)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Runtime-confirmed NAS indicator codes.
 * `1` = Gross Value Added, `5` = Gross Domestic Product.
 * Meaning is NEVER inferred from numeric ordering — the map is explicit.
 */
export const NAS_INDICATOR_CODE = {
  GVA: 1,
  GDP: 5,
} as const;

export type NasIndicatorKey = keyof typeof NAS_INDICATOR_CODE;

export const NAS_INDICATOR_NAME: Readonly<Record<number, string>> = {
  1: 'Gross Value Added',
  5: 'Gross Domestic Product',
};

// ────────────────────────────────────────────────────────────────────────────
// IIP — governed classification (NIC-2-digit manufacturing only)
// ────────────────────────────────────────────────────────────────────────────

/** The only IIP `type` authorized for the D08 governed request. */
export const IIP_GOVERNED_TYPE = 'Sectoral';

/** Types that must never be selected. */
export const IIP_BLOCKED_TYPES: readonly string[] = ['General', 'Use-based category'];

/**
 * The governed manufacturing category is resolved BY NAME at runtime, because
 * category codes are NOT portable across base years. Resolving by name is what
 * makes the selection deterministic without hard-coding a base-year-specific
 * code.
 */
export const IIP_GOVERNED_CATEGORY_NAME = 'Manufacturing';

/** Sectoral categories outside the governed manufacturing scope (§11). */
export const IIP_BLOCKED_CATEGORY_CODES: readonly number[] = [12, 13, 14];

/**
 * Valid IIP subcategory code shape, derived from the LIVE runtime enumeration
 * (hyphenated, e.g. `022011-1210`).
 *
 * DELIBERATELY NOT the stale Swagger regex `^\d+(,\d+)*$` — that pattern
 * rejects every valid hyphenated code. Runtime metadata governs these codes.
 */
export const IIP_SUBCATEGORY_CODE_PATTERN = /^\d{4,}-\d{3,}$/;

// ────────────────────────────────────────────────────────────────────────────
// Errors — fail-closed
// ────────────────────────────────────────────────────────────────────────────

export type MacroSourceErrorCode =
  | 'DATASET_NOT_APPROVED'
  | 'INDICATOR_NOT_GOVERNED'
  | 'REQUEST_FAILED'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'RETRY_BUDGET_EXHAUSTED'
  | 'INVALID_RESPONSE'
  | 'INCOMPLETE_PAGINATION'
  | 'ENUMERATION_UNAVAILABLE'
  | 'FILTER_CONTRACT_VIOLATION';

export class MacroSourceError extends Error {
  readonly code: MacroSourceErrorCode;
  readonly status?: number;
  readonly detail?: unknown;

  constructor(code: MacroSourceErrorCode, message: string, status?: number, detail?: unknown) {
    super(message);
    this.name = 'MacroSourceError';
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────────────

export interface MospiSourceConfig {
  readonly baseUrl?: string;
  /** Hard request timeout (D08 §2 item 20). */
  readonly timeoutMs?: number;
  /** Bounded retry budget (D08 §2 item 17). */
  readonly maxRetries?: number;
  readonly retryBaseDelayMs?: number;
  readonly retryMaxDelayMs?: number;
  /**
   * Upper bound on an honored `Retry-After` delay. Kept separate from
   * `retryMaxDelayMs` so a server-directed retry hint is honored at its
   * stated value, while the overall wait stays bounded.
   */
  readonly maxRetryAfterMs?: number;
  /** Records requested per page. Default page size is 10 — we raise it. */
  readonly pageSize?: number;
  /** Hard ceiling on pages, so a bad `totalPages` cannot loop forever. */
  readonly maxPages?: number;
  readonly fetchImpl?: typeof fetch;
  readonly sleepImpl?: (ms: number) => Promise<void>;
}

interface ResolvedConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly retryBaseDelayMs: number;
  readonly retryMaxDelayMs: number;
  readonly maxRetryAfterMs: number;
  readonly pageSize: number;
  readonly maxPages: number;
  readonly fetchImpl: typeof fetch;
  readonly sleepImpl: (ms: number) => Promise<void>;
}

const DEFAULT_CONFIG: Omit<ResolvedConfig, 'fetchImpl' | 'sleepImpl'> = {
  baseUrl: MOSPI_REST_BASE_URL,
  timeoutMs: 15_000,
  maxRetries: 3,
  retryBaseDelayMs: 250,
  retryMaxDelayMs: 4_000,
  maxRetryAfterMs: 30_000,
  pageSize: 100,
  maxPages: 500,
};

function resolveConfig(cfg: MospiSourceConfig = {}): ResolvedConfig {
  return {
    baseUrl: cfg.baseUrl ?? DEFAULT_CONFIG.baseUrl,
    timeoutMs: cfg.timeoutMs ?? DEFAULT_CONFIG.timeoutMs,
    maxRetries: cfg.maxRetries ?? DEFAULT_CONFIG.maxRetries,
    retryBaseDelayMs: cfg.retryBaseDelayMs ?? DEFAULT_CONFIG.retryBaseDelayMs,
    retryMaxDelayMs: cfg.retryMaxDelayMs ?? DEFAULT_CONFIG.retryMaxDelayMs,
    maxRetryAfterMs: cfg.maxRetryAfterMs ?? DEFAULT_CONFIG.maxRetryAfterMs,
    pageSize: cfg.pageSize ?? DEFAULT_CONFIG.pageSize,
    maxPages: cfg.maxPages ?? DEFAULT_CONFIG.maxPages,
    fetchImpl: cfg.fetchImpl ?? globalThis.fetch.bind(globalThis),
    sleepImpl: cfg.sleepImpl ?? defaultSleep,
  };
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ────────────────────────────────────────────────────────────────────────────
// Response envelope (live-confirmed shape)
// ────────────────────────────────────────────────────────────────────────────

export interface MospiPaginationMeta {
  readonly page: number;
  readonly totalRecords: number;
  readonly totalPages: number;
  readonly recordPerPage: number;
}

export interface MospiEnvelope<T> {
  readonly data?: readonly T[];
  readonly meta_data?: Partial<MospiPaginationMeta>;
  readonly msg?: string;
  readonly statusCode?: boolean;
  readonly error?: string;
}

/** Candidate implementation-level provenance dimensions. NOT M-3. */
export interface MacroCandidateProvenance {
  readonly baseYear?: string;
  readonly categoryCode?: number;
  readonly subcategoryCode?: string;
  readonly indicatorCode?: number;
  readonly apiContractVersion: string;
  readonly retrievalCompleteness: 'COMPLETE' | 'INCOMPLETE' | 'UNAVAILABLE';
}

export interface PaginatedResult<T> {
  readonly records: readonly T[];
  readonly pagination: {
    readonly pagesFetched: number;
    readonly expectedPages: number;
    readonly expectedRecords: number;
    readonly actualRecords: number;
    readonly duplicatesSuppressed: number;
  };
  readonly retrievalCompleteness: 'COMPLETE' | 'INCOMPLETE' | 'UNAVAILABLE';
  readonly provenance: MacroCandidateProvenance;
}

// ────────────────────────────────────────────────────────────────────────────
// Transport — NO-AUTH posture (D3 Option A)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Perform an unauthenticated GET with timeout + bounded retry/backoff.
 *
 * D3: NO credentials, NO `Authorization` header, NO token, NO account. The
 * request is never represented as authenticated. Throttling is treated as an
 * operational constraint, handled by bounded backoff — never by inventing
 * credentials.
 */
async function requestEnvelope<T>(
  url: string,
  cfg: ResolvedConfig,
): Promise<MospiEnvelope<T>> {
  const fetchImpl = cfg.fetchImpl;
  let lastError: unknown;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt += 1) {
    if (attempt > 0) {
      await cfg.sleepImpl(backoffDelay(attempt, cfg));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
    try {
      const res = await fetchImpl(url, {
        method: 'GET',
        signal: controller.signal,
        // NO-AUTH POSTURE: no Authorization header is ever constructed.
        headers: { Accept: 'application/json' },
      });

      if (res.status === 429) {
        lastError = new MacroSourceError('RATE_LIMITED', 'MoSPI returned HTTP 429 (throttled)', 429);
        if (attempt === cfg.maxRetries) break;
        const retryAfter = parseRetryAfter(res.headers?.get?.('retry-after') ?? null);
        if (retryAfter !== null) {
          await cfg.sleepImpl(Math.min(retryAfter, cfg.maxRetryAfterMs));
        }
        continue;
      }

      if (res.status >= 500) {
        lastError = new MacroSourceError('REQUEST_FAILED', `MoSPI returned HTTP ${res.status}`, res.status);
        if (attempt === cfg.maxRetries) break;
        continue;
      }

      if (!res.ok) {
        // 4xx other than 429 is terminal — retrying cannot help.
        throw new MacroSourceError('REQUEST_FAILED', `MoSPI returned HTTP ${res.status}`, res.status);
      }

      const body: unknown = await res.json();
      if (body === null || typeof body !== 'object') {
        throw new MacroSourceError('INVALID_RESPONSE', 'MoSPI response was not a JSON object');
      }
      return body as MospiEnvelope<T>;
    } catch (err) {
      if (err instanceof MacroSourceError && err.code === 'REQUEST_FAILED' && (err.status ?? 0) < 500) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new MacroSourceError('TIMEOUT', `request exceeded ${cfg.timeoutMs}ms`);
        if (attempt === cfg.maxRetries) break;
        continue;
      }
      lastError = err;
      if (attempt === cfg.maxRetries) break;
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError instanceof MacroSourceError) {
    // A terminal 429 that exhausted its budget is still a rate-limit failure.
    throw lastError;
  }
  throw new MacroSourceError(
    'RETRY_BUDGET_EXHAUSTED',
    `request failed after ${cfg.maxRetries + 1} attempt(s): ${String(lastError)}`,
  );
}

/** Exponential backoff with jitter, capped by `retryMaxDelayMs`. */
export function backoffDelay(attempt: number, cfg: ResolvedConfig): number {
  const raw = cfg.retryBaseDelayMs * 2 ** (attempt - 1);
  const jitter = Math.random() * cfg.retryBaseDelayMs;
  return Math.min(raw + jitter, cfg.retryMaxDelayMs);
}

/**
 * Parse a `Retry-After` header. Accepts delta-seconds; also accepts an HTTP
 * date. Returns null when absent/unparseable → caller falls back to backoff.
 */
export function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;

  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;

  const when = Date.parse(trimmed);
  if (Number.isNaN(when)) return null;
  return Math.max(0, when - Date.now());
}

// ────────────────────────────────────────────────────────────────────────────
// Pagination — complete retrieval, duplicate-safe, fail-closed
// ────────────────────────────────────────────────────────────────────────────

function assertDatasetApproved(dataset: MacroDataset): void {
  if (!APPROVED_DATASETS.includes(dataset)) {
    throw new MacroSourceError('DATASET_NOT_APPROVED', `dataset '${dataset}' is outside the D08 boundary`);
  }
}

function buildUrl(endpoint: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  return `${endpoint}?${search.toString()}`;
}

interface PageFetcher {
  (page: number): string;
}

async function fetchAllPages<T>(
  cfg: ResolvedConfig,
  baseUrl: string,
  buildPageUrl: PageFetcher,
  extraProvenance: Omit<MacroCandidateProvenance, 'apiContractVersion' | 'retrievalCompleteness'>,
): Promise<PaginatedResult<T>> {
  const seenPages = new Set<number>();
  const seenRecords = new Set<string>();
  const records: T[] = [];
  let duplicatesSuppressed = 0;

  let expectedPages = 0;
  let expectedRecords = 0;
  let page = 1;

  for (;;) {
    if (page > cfg.maxPages) {
      throw new MacroSourceError(
        'INCOMPLETE_PAGINATION',
        `pagination exceeded the ${cfg.maxPages}-page ceiling before completion`,
      );
    }
    if (seenPages.has(page)) {
      throw new MacroSourceError('INCOMPLETE_PAGINATION', `page ${page} was requested twice`);
    }
    seenPages.add(page);

    const envelope = await requestEnvelope<T>(`${baseUrl}${buildPageUrl(page)}`, cfg);

    if (typeof envelope.error === 'string' && envelope.error.length > 0) {
      throw new MacroSourceError('INVALID_RESPONSE', `MoSPI error: ${envelope.error}`, undefined, envelope);
    }
    if (!Array.isArray(envelope.data)) {
      throw new MacroSourceError('INVALID_RESPONSE', 'MoSPI response contained no data array', undefined, envelope);
    }

    const meta = envelope.meta_data;
    if (!meta || typeof meta.totalPages !== 'number' || typeof meta.totalRecords !== 'number') {
      // FAIL CLOSED: without trustworthy pagination metadata we cannot know the
      // result is complete, so we never return it as complete.
      throw new MacroSourceError(
        'INCOMPLETE_PAGINATION',
        'pagination metadata missing or malformed; refusing to treat response as complete',
        undefined,
        meta,
      );
    }

    expectedPages = meta.totalPages;
    expectedRecords = meta.totalRecords;

    for (const record of envelope.data) {
      const key = JSON.stringify(record);
      if (seenRecords.has(key)) {
        duplicatesSuppressed += 1;
        continue;
      }
      seenRecords.add(key);
      records.push(record);
    }

    if (page >= meta.totalPages) break;
    page += 1;
  }

  if (records.length !== expectedRecords) {
    // FAIL CLOSED: a short read is an error, not a complete result.
    throw new MacroSourceError(
      'INCOMPLETE_PAGINATION',
      `retrieved ${records.length} of ${expectedRecords} declared records`,
    );
  }

  return {
    records,
    pagination: {
      pagesFetched: seenPages.size,
      expectedPages,
      expectedRecords,
      actualRecords: records.length,
      duplicatesSuppressed,
    },
    retrievalCompleteness: 'COMPLETE',
    provenance: {
      ...extraProvenance,
      apiContractVersion: MACRO_API_CONTRACT_VERSION,
      retrievalCompleteness: 'COMPLETE',
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// NAS
// ────────────────────────────────────────────────────────────────────────────

export interface NasRecord {
  readonly base_year?: string;
  readonly series?: string;
  readonly year?: string;
  readonly indicator?: string;
  readonly frequency?: string;
  readonly revision?: string;
  readonly industry?: string | null;
  readonly subindustry?: string | null;
  readonly current_price?: string;
  readonly constant_price?: string;
  readonly unit?: string;
}

export interface NasQuery {
  readonly baseYear: string;
  readonly series: string;
  readonly frequencyCode: string;
  /** Must be an explicitly governed code (1 = GVA, 5 = GDP). */
  readonly indicatorCode: number;
}

/** NAS indicator codes are explicit; meaning is never inferred from order. */
export function assertGovernedNasIndicator(code: number): void {
  if (!(Object.values(NAS_INDICATOR_CODE) as number[]).includes(code)) {
    throw new MacroSourceError(
      'INDICATOR_NOT_GOVERNED',
      `indicator_code ${code} is not a governed NAS indicator (1 = GVA, 5 = GDP)`,
    );
  }
}

export function buildNasQuery(query: NasQuery, page: number, pageSize: number): string {
  assertGovernedNasIndicator(query.indicatorCode);
  return buildUrl(DATA_ENDPOINT.NAS, {
    base_year: query.baseYear,
    series: query.series,
    frequency_code: query.frequencyCode,
    indicator_code: query.indicatorCode,
    Format: 'JSON',
    limit: pageSize,
    page,
  });
}

export async function fetchNasObservations(
  query: NasQuery,
  cfg: MospiSourceConfig = {},
): Promise<PaginatedResult<NasRecord>> {
  assertDatasetApproved('NAS');
  assertGovernedNasIndicator(query.indicatorCode);
  const resolved = resolveConfig(cfg);
  return fetchAllPages<NasRecord>(
    resolved,
    resolved.baseUrl,
    (page) => buildNasQuery(query, page, resolved.pageSize),
    { baseYear: query.baseYear, indicatorCode: query.indicatorCode },
  );
}

// ────────────────────────────────────────────────────────────────────────────
// IIP — runtime enumeration + governed classification
// ────────────────────────────────────────────────────────────────────────────

export interface IipRecord {
  readonly base_year?: string;
  readonly year?: string;
  readonly type?: string;
  readonly category?: string;
  readonly sub_category?: string;
  readonly index?: string;
  readonly growth_rate?: string;
}

export interface IipCategory {
  readonly categoryCode: number;
  readonly categoryName: string;
  readonly type: string;
}

export interface IipSubcategory {
  readonly subcategoryCode: string;
  readonly categoryCode: number;
  readonly subcategoryName: string;
}

export interface IipFilterSet {
  readonly baseYear: string;
  readonly frequency: string;
  readonly types: readonly string[];
  readonly categories: readonly IipCategory[];
  readonly subcategories: readonly IipSubcategory[];
}

interface RawIipFilterPayload {
  data?: {
    type?: readonly { type?: string }[];
    category?: readonly { category_code?: number; category_name?: string; type?: string }[];
    subcategory?: readonly {
      subcategory_code?: string;
      category_code?: number;
      subcategory_name?: string;
    }[];
  };
  error?: string;
  statusCode?: boolean;
}

/**
 * Retrieve the IIP category/subcategory enumeration for a specific base year.
 *
 * Codes are base-year dependent, so they are ALWAYS resolved from runtime
 * metadata and never hard-coded. This is the single source of truth that
 * replaces the stale Swagger category range and regex.
 */
export async function fetchIipFilters(
  baseYear: string,
  frequency = 'Annually',
  cfg: MospiSourceConfig = {},
): Promise<IipFilterSet> {
  const resolved = resolveConfig(cfg);
  const url = `${resolved.baseUrl}${buildUrl(IIP_FILTER_ENDPOINT, {
    base_year: baseYear,
    frequency,
    Format: 'JSON',
  })}`;

  const payload = await requestEnvelope<unknown>(url, resolved);
  const raw = payload as RawIipFilterPayload;

  if (typeof raw.error === 'string' && raw.error.length > 0) {
    throw new MacroSourceError('ENUMERATION_UNAVAILABLE', `IIP filter error: ${raw.error}`, undefined, raw);
  }
  if (!raw.data || !Array.isArray(raw.data.category) || !Array.isArray(raw.data.subcategory)) {
    throw new MacroSourceError(
      'ENUMERATION_UNAVAILABLE',
      'IIP filter response did not contain category/subcategory arrays',
      undefined,
      raw,
    );
  }

  const categories: IipCategory[] = [];
  for (const entry of raw.data.category) {
    if (typeof entry.category_code !== 'number' || typeof entry.category_name !== 'string') continue;
    categories.push({
      categoryCode: entry.category_code,
      categoryName: entry.category_name,
      type: entry.type ?? '',
    });
  }

  const subcategories: IipSubcategory[] = [];
  for (const entry of raw.data.subcategory) {
    if (typeof entry.subcategory_code !== 'string' || typeof entry.category_code !== 'number') continue;
    subcategories.push({
      subcategoryCode: entry.subcategory_code,
      categoryCode: entry.category_code,
      subcategoryName: entry.subcategory_name ?? '',
    });
  }

  if (categories.length === 0 || subcategories.length === 0) {
    throw new MacroSourceError(
      'ENUMERATION_UNAVAILABLE',
      `IIP enumeration for base year ${baseYear} yielded no usable codes`,
      undefined,
      raw,
    );
  }

  return {
    baseYear,
    frequency,
    types: (raw.data.type ?? []).map((t) => t.type ?? '').filter((t) => t.length > 0),
    categories,
    subcategories,
  };
}

export interface GovernedIipSelection {
  readonly baseYear: string;
  readonly frequency: string;
  readonly type: string;
  readonly categoryCode: number;
  readonly categoryName: string;
  /** NIC-2-digit divisions belonging to the governed category. */
  readonly subcategoryCodes: readonly string[];
}

/**
 * Resolve the governed manufacturing category and its NIC-2 subcategories from
 * a runtime enumeration.
 *
 * §11 governance safety — this rejects:
 *   - `General` and `Use-based category` types;
 *   - Mining (12), Electricity & Gas (13), Water/Sewerage (14);
 *   - subcategories not belonging to the resolved manufacturing category;
 *   - subcategory codes that do not match the live hyphenated shape.
 */
export function resolveGovernedManufacturing(set: IipFilterSet): GovernedIipSelection {
  if (IIP_BLOCKED_TYPES.some((blocked) => set.types.includes(blocked)) === false) {
    // Not fatal — but if the enumeration does not even list the blocked types
    // we cannot confirm the type taxonomy, so fail closed.
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      'IIP enumeration did not expose the expected type taxonomy',
      undefined,
      set.types,
    );
  }
  if (!set.types.includes(IIP_GOVERNED_TYPE)) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `IIP enumeration for base year ${set.baseYear} has no '${IIP_GOVERNED_TYPE}' type`,
      undefined,
      set.types,
    );
  }

  const matches = set.categories.filter(
    (c) => c.type === IIP_GOVERNED_TYPE && c.categoryName === IIP_GOVERNED_CATEGORY_NAME,
  );
  if (matches.length !== 1) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `expected exactly one '${IIP_GOVERNED_CATEGORY_NAME}' category for base year ${set.baseYear}, found ${matches.length}`,
      undefined,
      set.categories,
    );
  }

  const category = matches[0]!;
  if (IIP_BLOCKED_CATEGORY_CODES.includes(category.categoryCode)) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `resolved category code ${category.categoryCode} is outside the governed manufacturing scope`,
    );
  }

  const codes = set.subcategories
    .filter((s) => s.categoryCode === category.categoryCode)
    .map((s) => s.subcategoryCode)
    .filter((code) => IIP_SUBCATEGORY_CODE_PATTERN.test(code));

  if (codes.length === 0) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `no NIC-2 subcategories resolved for category ${category.categoryCode} (base year ${set.baseYear})`,
    );
  }

  return {
    baseYear: set.baseYear,
    frequency: set.frequency,
    type: IIP_GOVERNED_TYPE,
    categoryCode: category.categoryCode,
    categoryName: category.categoryName,
    subcategoryCodes: codes,
  };
}

/** Runtime-resolve the governed IIP selection for a base year. */
export async function resolveGovernedIipSelection(
  baseYear: string,
  frequency = 'Annually',
  cfg: MospiSourceConfig = {},
): Promise<GovernedIipSelection> {
  const set = await fetchIipFilters(baseYear, frequency, cfg);
  return resolveGovernedManufacturing(set);
}

export interface IipQuery {
  readonly baseYear: string;
  readonly frequency: string;
  readonly type: string;
  readonly categoryCode: number;
  readonly subcategoryCode: string;
}

/** Validate an IIP request against the governed classification (§11). */
export function assertGovernedIipQuery(
  query: IipQuery,
  selection?: GovernedIipSelection,
): void {
  if (query.type !== IIP_GOVERNED_TYPE) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `IIP type '${query.type}' is not governed; only '${IIP_GOVERNED_TYPE}' is authorized`,
    );
  }
  if (IIP_BLOCKED_CATEGORY_CODES.includes(query.categoryCode)) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `category_code ${query.categoryCode} is outside the governed manufacturing scope`,
    );
  }
  if (!IIP_SUBCATEGORY_CODE_PATTERN.test(query.subcategoryCode)) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `subcategory_code '${query.subcategoryCode}' is not a governed NIC-2 code`,
    );
  }
  if (selection) {
    if (selection.baseYear !== query.baseYear) {
      throw new MacroSourceError(
        'FILTER_CONTRACT_VIOLATION',
        `selection was resolved for base year ${selection.baseYear}, not ${query.baseYear}`,
      );
    }
    if (selection.categoryCode !== query.categoryCode) {
      throw new MacroSourceError(
        'FILTER_CONTRACT_VIOLATION',
        `category_code ${query.categoryCode} does not match the runtime-resolved ${selection.categoryCode}`,
      );
    }
    if (!selection.subcategoryCodes.includes(query.subcategoryCode)) {
      throw new MacroSourceError(
        'FILTER_CONTRACT_VIOLATION',
        `subcategory_code '${query.subcategoryCode}' is not in the runtime-resolved NIC-2 set`,
      );
    }
  }
}

export function buildIipQuery(query: IipQuery, page: number, pageSize: number): string {
  assertGovernedIipQuery(query);
  return buildUrl(DATA_ENDPOINT.IIP, {
    base_year: query.baseYear,
    frequency: query.frequency,
    type: query.type,
    category_code: query.categoryCode,
    subcategory_code: query.subcategoryCode,
    Format: 'JSON',
    limit: pageSize,
    page,
  });
}

export async function fetchIipObservations(
  query: IipQuery,
  selection: GovernedIipSelection,
  cfg: MospiSourceConfig = {},
): Promise<PaginatedResult<IipRecord>> {
  assertDatasetApproved('IIP');
  assertGovernedIipQuery(query, selection);
  const resolved = resolveConfig(cfg);
  return fetchAllPages<IipRecord>(
    resolved,
    resolved.baseUrl,
    (page) => buildIipQuery(query, page, resolved.pageSize),
    {
      baseYear: query.baseYear,
      categoryCode: query.categoryCode,
      subcategoryCode: query.subcategoryCode,
    },
  );
}

// ────────────────────────────────────────────────────────────────────────────
// CPI
// ────────────────────────────────────────────────────────────────────────────

export interface CpiRecord {
  readonly base_year?: string;
  readonly series?: string;
  readonly year?: string;
  readonly month?: string;
  readonly group?: string | null;
  readonly sub_group?: string | null;
  readonly sector?: string | null;
  readonly state?: string | null;
  readonly index?: string;
  readonly inflation_rate?: string;
}

export interface CpiQuery {
  /**
   * CPI base years differ from IIP/NAS base years (`2012` / `2010` / `2024`),
   * so the base year is supplied explicitly per dataset and never inherited
   * from another dataset's contract.
   */
  readonly baseYear: string;
  readonly series: string;
}

export function buildCpiQuery(query: CpiQuery, page: number, pageSize: number): string {
  return buildUrl(DATA_ENDPOINT.CPI, {
    base_year: query.baseYear,
    series: query.series,
    Format: 'JSON',
    limit: pageSize,
    page,
  });
}

export async function fetchCpiObservations(
  query: CpiQuery,
  cfg: MospiSourceConfig = {},
): Promise<PaginatedResult<CpiRecord>> {
  assertDatasetApproved('CPI');
  const resolved = resolveConfig(cfg);
  return fetchAllPages<CpiRecord>(
    resolved,
    resolved.baseUrl,
    (page) => buildCpiQuery(query, page, resolved.pageSize),
    { baseYear: query.baseYear },
  );
}
