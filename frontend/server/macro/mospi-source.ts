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
  /**
   * CPI retrieval scope actually requested upstream.
   *
   * The CPI endpoint returns its ENTIRE history when no `year` is supplied, so
   * every CPI call is year-scoped and the requested scope is surfaced here.
   * A single year's observations are never presented as the full history.
   */
  readonly cpiYear?: string;
  /** CPI series requested upstream (echoed scope; the provider omits it per record). */
  readonly cpiSeries?: string;
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
    /**
     * Rows returned to the caller. Identical to `records.length`; stated
     * explicitly so a row-preserving dataset (CPI) can be checked without
     * inferring anything from the deduplication counters.
     */
    readonly recordsRetained: number;
    /** Every row received from the provider across all pages, before suppression. */
    readonly rawRowsReceived: number;
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

/** One validated page: envelope contract already checked, metadata extracted. */
interface PageRead<T> {
  readonly page: number;
  readonly records: readonly T[];
  readonly totalPages: number;
  readonly totalRecords: number;
}

/**
 * Fetch and validate a single page.
 *
 * FAIL CLOSED at every step: a provider-reported error, a missing data array,
 * or missing/malformed pagination metadata is an error — never a partial result
 * that could be mistaken for a complete one.
 */
async function readPage<T>(
  cfg: ResolvedConfig,
  baseUrl: string,
  buildPageUrl: PageFetcher,
  page: number,
): Promise<PageRead<T>> {
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

  return { page, records: envelope.data, totalPages: meta.totalPages, totalRecords: meta.totalRecords };
}

interface FetchAllPagesOptions {
  /**
   * Maximum in-flight page requests. `1` (the default) is the strictly
   * sequential path used by NAS/IIP; CPI opts into bounded concurrency.
   */
  readonly concurrency?: number;
  /**
   * Whether byte-identical rows may be collapsed. Default `true`.
   *
   * DEDUPLICATION IS DATASET-SPECIFIC, NOT A GLOBAL RULE:
   *   - NAS / IIP keep the default. Their observed responses repeat identical
   *     rows across page boundaries, and collapsing them is intended.
   *   - CPI preserves EVERY provider row (`false`). CPI rows are only unique
   *     in combination — month x group x subgroup x sector x state — so
   *     byte-identical JSON rows are genuine distinct observations (the same
   *     combination recorded for more than one item). Collapsing them made the
   *     retrieved total disagree with the provider-declared total and produced
   *     a false `INCOMPLETE_PAGINATION` (live: 25,726 retained of 25,884).
   *     Only 158 of 25,884 rows were affected, which is why the gap was small
   *     but fatal.
   */
  readonly deduplicate?: boolean;
}

async function fetchAllPages<T>(
  cfg: ResolvedConfig,
  baseUrl: string,
  buildPageUrl: PageFetcher,
  extraProvenance: Omit<MacroCandidateProvenance, 'apiContractVersion' | 'retrievalCompleteness'>,
  options: FetchAllPagesOptions = {},
): Promise<PaginatedResult<T>> {
  const concurrency = Math.max(1, Math.floor(options.concurrency ?? 1));
  const deduplicate = options.deduplicate ?? true;
  const seenPages = new Set<number>();
  const seenRecords = new Set<string>();
  const records: T[] = [];
  let duplicatesSuppressed = 0;
  let rawRowsReceived = 0;

  let expectedPages = 0;
  let expectedRecords = 0;

  const absorb = (items: readonly T[]): void => {
    for (const record of items) {
      rawRowsReceived += 1;
      if (deduplicate) {
        const key = JSON.stringify(record);
        if (seenRecords.has(key)) {
          duplicatesSuppressed += 1;
          continue;
        }
        seenRecords.add(key);
      }
      records.push(record);
    }
  };

  if (concurrency === 1) {
    // --- sequential path (NAS/IIP, and any caller that does not opt in) ------
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

      const read = await readPage<T>(cfg, baseUrl, buildPageUrl, page);
      expectedPages = read.totalPages;
      expectedRecords = read.totalRecords;
      absorb(read.records);

      if (page >= read.totalPages) break;
      page += 1;
    }
  } else {
    // --- bounded-concurrency path (CPI) -------------------------------------
    // Page 1 is read first: it is the only page that tells us how many pages
    // exist, and it fixes the metadata every later page must agree with.
    if (seenPages.has(1)) {
      throw new MacroSourceError('INCOMPLETE_PAGINATION', 'page 1 was requested twice');
    }
    seenPages.add(1);

    const first = await readPage<T>(cfg, baseUrl, buildPageUrl, 1);
    expectedPages = first.totalPages;
    expectedRecords = first.totalRecords;

    if (expectedPages > cfg.maxPages) {
      throw new MacroSourceError(
        'INCOMPLETE_PAGINATION',
        `pagination exceeded the ${cfg.maxPages}-page ceiling before completion`,
      );
    }

    const pages: PageRead<T>[] = [first];
    const pending: number[] = [];
    for (let page = 2; page <= expectedPages; page += 1) pending.push(page);

    let cursor = 0;
    const worker = async (): Promise<void> => {
      for (;;) {
        const index = cursor;
        cursor += 1;
        if (index >= pending.length) return;
        const page = pending[index]!;

        const read = await readPage<T>(cfg, baseUrl, buildPageUrl, page);
        if (read.totalPages !== expectedPages || read.totalRecords !== expectedRecords) {
          // FAIL CLOSED: the result set moved underneath us, so the retrieval
          // cannot be shown to be complete.
          throw new MacroSourceError(
            'INCOMPLETE_PAGINATION',
            `page ${page} reported ${read.totalRecords} records over ${read.totalPages} pages, ` +
              `but page 1 reported ${expectedRecords} over ${expectedPages}; refusing to treat the response as complete`,
          );
        }
        pages.push(read);
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, () => worker()));

    // Deterministic output: page order, then provider row order within a page.
    pages.sort((a, b) => a.page - b.page);
    for (const read of pages) {
      seenPages.add(read.page);
      absorb(read.records);
    }
  }

  if (records.length !== expectedRecords) {
    // FAIL CLOSED: a short read is an error, not a complete result. The
    // message names every figure needed to tell a genuine short read apart
    // from a deduplication artefact, and is dataset-neutral because the same
    // check serves NAS, IIP and CPI.
    throw new MacroSourceError(
      'INCOMPLETE_PAGINATION',
      `pagination incomplete: recordsRetained=${records.length}, rawRowsReceived=${rawRowsReceived}, ` +
        `duplicatesSuppressed=${duplicatesSuppressed}, pagesFetched=${seenPages.size}/${expectedPages}, ` +
        `providerDeclaredRecords=${expectedRecords}`,
    );
  }

  return {
    records,
    pagination: {
      pagesFetched: seenPages.size,
      expectedPages,
      expectedRecords,
      actualRecords: records.length,
      recordsRetained: records.length,
      rawRowsReceived,
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

/**
 * CPI is bounded to a single year — live-measured 2026-10-15.
 *
 * The provider returns its ENTIRE history when `year` is omitted (326,442
 * records / 3,265 pages at `limit=100`), which cannot be retrieved inside the
 * page ceiling or the request budget. With `year` supplied the same endpoint
 * returns one year (2025: 25,884 records / 259 pages). The `year` filter is
 * the ONLY parameter observed to reduce the result set — `month`, `state`,
 * `sector`, `from_year`, `to_year`, `start_year` and `end_year` did not.
 *
 * Therefore the CPI path always sends `year`. The default is a fixed,
 * verified-populated year rather than "whatever year it is now", so a run is
 * reproducible and never silently switches to a year the provider has not
 * published. Callers override it explicitly (`/api/macro/cpi?year=2024`), and
 * the applied scope is reported back in `provenance.cpiYear` — a single year's
 * observations are never presented as the complete all-history dataset.
 */
export const CPI_DEFAULT_YEAR = '2025';

/**
 * Page ceiling for CPI only.
 *
 * NAS/IIP keep the transport default (500). A single-year CPI slice is
 * ~259 pages live-measured, so the transport default would already fit, but the
 * year override needs headroom: 1,000 pages x 100 records is a hard bound of
 * 100,000 records — still far below the 3,265 pages the unfiltered dataset would
 * need, which stays deliberately out of scope.
 */
export const CPI_MAX_PAGES = 1_000;

/**
 * Provider-accepted maximum page size.
 *
 * Live-measured: `limit=100` is honoured, `limit=500` is rejected with HTTP 400.
 */
export const CPI_MAX_PAGE_SIZE = 100;

/**
 * Bounded page concurrency for CPI only.
 *
 * Sequential retrieval of ~259 pages is what makes the request feel like a
 * timeout. Four in-flight pages keeps the wall clock reasonable while staying
 * conservative on a throttled, credential-free endpoint (429s still honour
 * Retry-After). NAS/IIP remain strictly sequential.
 */
export const CPI_FETCH_CONCURRENCY = 4;

export interface CpiQuery {
  /**
   * CPI base years differ from IIP/NAS base years (`2012` / `2010` / `2024`),
   * so the base year is supplied explicitly per dataset and never inherited
   * from another dataset's contract.
   */
  readonly baseYear: string;
  readonly series: string;
  /**
   * Retrieval year. Omitted means the governed default (`CPI_DEFAULT_YEAR`);
   * there is deliberately no "all years" option.
   */
  readonly year?: string;
}

/** Four-digit year, nothing else — the provider's own accepted form. */
const CPI_YEAR_PATTERN = /^\d{4}$/;

/** Resolve and validate the CPI year. Fails closed on anything unusable. */
export function resolveCpiYear(year?: string): string {
  const candidate = (year ?? CPI_DEFAULT_YEAR).trim();
  if (!CPI_YEAR_PATTERN.test(candidate)) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `CPI year '${year ?? ''}' is not a four-digit year`,
    );
  }
  return candidate;
}

/** Reject a page size the provider will not honour (it 400s above 100). */
function assertCpiPageSize(pageSize: number): void {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > CPI_MAX_PAGE_SIZE) {
    throw new MacroSourceError(
      'FILTER_CONTRACT_VIOLATION',
      `CPI page size ${pageSize} is outside 1..${CPI_MAX_PAGE_SIZE} (the provider rejects limit=500)`,
    );
  }
}

/**
 * Map a provider CPI row onto the application record contract.
 *
 * The live response uses `baseyear`, `subgroup` and `inflation`; the
 * application contract (and the research UI) uses `base_year`, `sub_group` and
 * `inflation_rate`. Both spellings are accepted so a fixture or a provider
 * revision using either form maps correctly. Every field the provider returns
 * is carried through — none is dropped, and no value is invented. `series` is
 * the one field the provider does not return per row, so the requested series
 * is echoed as retrieval scope (also reported in `provenance.cpiSeries`).
 */
export function mapCpiRecord(raw: unknown, requestedSeries: string): CpiRecord {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new MacroSourceError(
      'INVALID_RESPONSE',
      'CPI response contained a record that is not a JSON object',
      undefined,
      raw,
    );
  }
  const source = raw as Record<string, unknown>;

  const firstText = (...keys: readonly string[]): string | undefined => {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value !== '') return value;
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    }
    return undefined;
  };
  const firstTextOrNull = (...keys: readonly string[]): string | null | undefined => {
    for (const key of keys) {
      if (!(key in source)) continue;
      const value = source[key];
      if (value === null || value === '') return null;
      if (typeof value === 'string') return value;
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    }
    return undefined;
  };

  return {
    base_year: firstText('base_year', 'baseyear'),
    series: firstText('series') ?? requestedSeries,
    year: firstText('year'),
    month: firstText('month'),
    group: firstTextOrNull('group'),
    sub_group: firstTextOrNull('sub_group', 'subgroup'),
    sector: firstTextOrNull('sector'),
    state: firstTextOrNull('state'),
    index: firstText('index'),
    inflation_rate: firstText('inflation_rate', 'inflation'),
  };
}

export function buildCpiQuery(query: CpiQuery, page: number, pageSize: number): string {
  assertCpiPageSize(pageSize);
  return buildUrl(DATA_ENDPOINT.CPI, {
    base_year: query.baseYear,
    series: query.series,
    // Always present: an absent `year` means "the provider's whole history",
    // which is never what this application wants.
    year: resolveCpiYear(query.year),
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
  const year = resolveCpiYear(query.year);
  // CPI-only page ceiling; a caller-supplied bound still wins.
  const resolved = resolveConfig({ ...cfg, maxPages: cfg.maxPages ?? CPI_MAX_PAGES });
  const retrieved = await fetchAllPages<unknown>(
    resolved,
    resolved.baseUrl,
    (page) => buildCpiQuery({ ...query, year }, page, resolved.pageSize),
    { baseYear: query.baseYear, cpiYear: year, cpiSeries: query.series },
    { concurrency: CPI_FETCH_CONCURRENCY, deduplicate: false },
  );
  return {
    ...retrieved,
    records: retrieved.records.map((record) => mapCpiRecord(record, query.series)),
  };
}
