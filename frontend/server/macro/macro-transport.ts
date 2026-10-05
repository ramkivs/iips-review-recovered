/**
 * Program v3.0 — NP-08 / D08 MACRO: `/api/macro` transport handler.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  GOVERNANCE STATUS
 * ═══════════════════════════════════════════════════════════════════════════
 * Authorized by `NP-08-D08-MACRO-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`
 * (D1 implementation · D2 creation on origin/main · D3 throttled no-auth).
 *
 * NOT authorized here: MoSPI provider designation, entitlement, commercial
 * use, redistribution, caching, retention, attribution, M-3, production,
 * D08 boundary expansion.
 *
 * D08 boundary: NAS / CPI / IIP only.
 *
 * GUARDED READ — this handler is strictly read-only:
 *   - only GET/HEAD are accepted (405 otherwise);
 *   - only the drei approved datasets are addressable (404 otherwise);
 *   - the dataset path is matched EXACTLY, so a path that merely starts with
 *     an approved dataset (e.g. `/api/macro/nasEVIL`) is a 404 and never
 *     reaches the MoSPI boundary.
 *
 * FAIL-CLOSED — any upstream error is surfaced as an error response. A failed
 * or partial retrieval is NEVER converted into observations, and no snapshot,
 * fallback payload, or synthetic value is ever produced.
 *
 * NO-AUTH — this route performs unauthenticated upstream requests under D3
 * Option A. It does NOT represent them as authenticated and confers no
 * entitlement.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  APPROVED_DATASETS,
  MACRO_SOURCE_ID,
  MacroSourceError,
  NAS_INDICATOR_CODE,
  type MacroDataset,
  type MospiSourceConfig,
  fetchCpiObservations,
  fetchIipObservations,
  fetchNasObservations,
  resolveGovernedIipSelection,
} from './mospi-source';

export const MACRO_ROUTE_PREFIX = '/api/macro/';

/** Defaults are explicit — nothing is silently defaulted at the MoSPI layer. */
const DEFAULT_NAS_BASE_YEAR = '2022-23';
const DEFAULT_NAS_SERIES = 'Current';
const DEFAULT_NAS_FREQUENCY_CODE = 'Annually';
const DEFAULT_IIP_BASE_YEAR = '2022-23';
const DEFAULT_IIP_FREQUENCY = 'Annually';
/** CPI base years are a different enumeration (`2012`/`2010`/`2024`). */
const DEFAULT_CPI_BASE_YEAR = '2012';
const DEFAULT_CPI_SERIES = 'Current';

interface MacroRouteDeps {
  readonly config?: MospiSourceConfig;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function parseDataset(pathname: string): MacroDataset | null {
  const match = /^\/api\/macro\/([A-Za-z]+)$/.exec(pathname);
  if (!match) return null;
  const candidate = match[1]!.toUpperCase();
  return (APPROVED_DATASETS as readonly string[]).includes(candidate)
    ? (candidate as MacroDataset)
    : null;
}

function query(url: URL, key: string, fallback: string): string {
  const value = url.searchParams.get(key);
  return value === null || value.trim() === '' ? fallback : value.trim();
}

/**
 * Handle a `/api/macro/...` request.
 *
 * Returns true when the request was handled (caller must not continue
 * dispatch), false when the path is not on the Macro namespace.
 */
export async function handleMacroRequest(
  req: IncomingMessage,
  res: ServerResponse,
  deps: MacroRouteDeps = {},
): Promise<boolean> {
  const pathname = (req.url ?? '').split('?')[0] ?? '';
  if (!pathname.startsWith(MACRO_ROUTE_PREFIX)) return false;

  // --- guarded read: method -------------------------------------------------
  const method = (req.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    sendJson(res, 405, { error: 'method not allowed; /api/macro is read-only' });
    return true;
  }

  // --- guarded read: dataset allowlist (exact match) ------------------------
  const dataset = parseDataset(pathname);
  if (dataset === null) {
    sendJson(res, 404, {
      error: 'unknown macro dataset',
      approvedDatasets: APPROVED_DATASETS,
    });
    return true;
  }

  const config = deps.config ?? {};
  const url = new URL(req.url ?? '/', 'http://localhost');

  try {
    if (dataset === 'NAS') {
      // NAS indicator must be EXPLICIT (never an implicit/default indicator).
      const rawIndicator = url.searchParams.get('indicatorCode');
      const indicatorKey = url.searchParams.get('indicator');
      let indicatorCode: number;
      if (rawIndicator !== null && rawIndicator.trim() !== '') {
        indicatorCode = Number(rawIndicator);
      } else if (indicatorKey !== null && indicatorKey.trim() !== '') {
        const mapped = NAS_INDICATOR_CODE[indicatorKey.trim().toUpperCase() as 'GVA' | 'GDP'];
        if (mapped === undefined) {
          sendJson(res, 400, {
            error: `unknown indicator '${indicatorKey}'; governed values: GVA, GDP`,
          });
          return true;
        }
        indicatorCode = mapped;
      } else {
        sendJson(res, 400, {
          error: 'indicatorCode is required (1 = Gross Value Added, 5 = Gross Domestic Product)',
        });
        return true;
      }
      if (!Number.isInteger(indicatorCode)) {
        sendJson(res, 400, { error: 'indicatorCode must be an integer' });
        return true;
      }

      const result = await fetchNasObservations(
        {
          baseYear: query(url, 'baseYear', DEFAULT_NAS_BASE_YEAR),
          series: query(url, 'series', DEFAULT_NAS_SERIES),
          frequencyCode: query(url, 'frequencyCode', DEFAULT_NAS_FREQUENCY_CODE),
          indicatorCode,
        },
        config,
      );
      sendJson(res, 200, {
        dataset,
        source: MACRO_SOURCE_ID,
        records: result.records,
        pagination: result.pagination,
        provenance: result.provenance,
      });
      return true;
    }

    if (dataset === 'IIP') {
      const baseYear = query(url, 'baseYear', DEFAULT_IIP_BASE_YEAR);
      const frequency = query(url, 'frequency', DEFAULT_IIP_FREQUENCY);

      // Runtime enumeration per base year — codes are never hard-coded here.
      const selection = await resolveGovernedIipSelection(baseYear, frequency, config);
      const subcategoryCode = url.searchParams.get('subcategoryCode');

      if (subcategoryCode === null || subcategoryCode.trim() === '') {
        // Metadata-only response: the governed selection, no observations.
        sendJson(res, 200, {
          dataset,
          source: MACRO_SOURCE_ID,
          selection,
          records: [],
        });
        return true;
      }

      const result = await fetchIipObservations(
        {
          baseYear,
          frequency,
          type: selection.type,
          categoryCode: selection.categoryCode,
          subcategoryCode: subcategoryCode.trim(),
        },
        selection,
        config,
      );
      sendJson(res, 200, {
        dataset,
        source: MACRO_SOURCE_ID,
        selection,
        records: result.records,
        pagination: result.pagination,
        provenance: result.provenance,
      });
      return true;
    }

    // dataset === 'CPI'
    const result = await fetchCpiObservations(
      {
        baseYear: query(url, 'baseYear', DEFAULT_CPI_BASE_YEAR),
        series: query(url, 'series', DEFAULT_CPI_SERIES),
      },
      config,
    );
    sendJson(res, 200, {
      dataset,
      source: MACRO_SOURCE_ID,
      records: result.records,
      pagination: result.pagination,
      provenance: result.provenance,
    });
    return true;
  } catch (err) {
    // FAIL CLOSED: surface the failure, never fabricate or fall back.
    if (err instanceof MacroSourceError) {
      sendJson(res, 502, {
        error: 'macro upstream failure',
        code: err.code,
        message: err.message,
        dataset,
      });
      return true;
    }
    sendJson(res, 500, {
      error: 'macro transport error',
      message: err instanceof Error ? err.message : String(err),
      dataset,
    });
    return true;
  }
}
